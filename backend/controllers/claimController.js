const ClaimRequest = require('../models/ClaimRequest');
const Item = require('../models/Item');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');

// @desc    Create a new claim request
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
  try {
    const { itemId, itemModel, message } = req.body;

    // 1. Validation
    if (!itemId || !itemModel || !message) {
      return res.status(400).json({ message: 'Please add all required fields: itemId, itemModel, and message' });
    }

    if (!['Item', 'FoundItem'].includes(itemModel)) {
      return res.status(400).json({ message: 'Invalid item model type' });
    }

    // 2. Fetch target item & identify owner
    let item;
    if (itemModel === 'Item') {
      item = await Item.findById(itemId);
    } else {
      item = await FoundItem.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const ownerId = item.user.toString();
    const claimerId = req.user.id;

    // 3. Prevent owners from claiming their own items
    if (ownerId === claimerId) {
      return res.status(400).json({ message: 'You cannot submit a claim request on your own reported item' });
    }

    // 4. Duplicate prevention
    const existingClaim = await ClaimRequest.findOne({
      item: itemId,
      claimer: claimerId,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted an active claim request for this item' });
    }

    // 5. Create claim request
    const claim = await ClaimRequest.create({
      item: itemId,
      itemModel,
      claimer: claimerId,
      owner: ownerId,
      message,
    });

    // 6. Create notification for item owner
    await Notification.create({
      user: ownerId,
      title: 'New Claim Request',
      message: `${req.user.name} submitted a claim request for your item "${item.title}".`,
      type: 'claim_created',
      relatedClaim: claim._id,
      relatedItem: itemId,
      itemModel,
    });

    res.status(201).json(claim);
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ message: 'Server error during claim request creation', error: error.message });
  }
};

// @desc    Get claims submitted by the logged-in user
// @route   GET /api/claims/my-claims
// @access  Private
const getMyClaims = async (req, res) => {
  try {
    const claims = await ClaimRequest.find({ claimer: req.user.id })
      .populate({
        path: 'item',
        select: 'title description imageUrl location date dateFound category status'
      })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({ message: 'Server error retrieving your claims', error: error.message });
  }
};

// @desc    Get incoming claim requests received by the logged-in user (as owner)
// @route   GET /api/claims/received
// @access  Private
const getReceivedClaims = async (req, res) => {
  try {
    const claims = await ClaimRequest.find({ owner: req.user.id })
      .populate({
        path: 'item',
        select: 'title description imageUrl location date dateFound category status'
      })
      .populate('claimer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    console.error('Get received claims error:', error);
    res.status(500).json({ message: 'Server error retrieving incoming claims', error: error.message });
  }
};

// @desc    Update claim request status (Approve or Reject)
// @route   PUT /api/claims/:id
// @access  Private
const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claimId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const claim = await ClaimRequest.findById(claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    // Authorization: Check if caller is the item owner
    if (claim.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized. Only the item reporter can update the status.' });
    }

    claim.status = status;
    const updatedClaim = await claim.save();

    // Fetch the related item title for notification message
    let item;
    if (claim.itemModel === 'Item') {
      item = await Item.findById(claim.item);
    } else {
      item = await FoundItem.findById(claim.item);
    }
    const itemTitle = item ? item.title : 'your item';

    // Cascading updates and notifications on approval/rejection
    if (status === 'approved') {
      // 1. Notify the approved claimer
      await Notification.create({
        user: claim.claimer,
        title: 'Claim Approved 🎉',
        message: `Your claim request for "${itemTitle}" has been approved!`,
        type: 'claim_approved',
        relatedClaim: claim._id,
        relatedItem: claim.item,
        itemModel: claim.itemModel,
      });

      // 2. Fetch all other pending claims to create rejection notifications for them
      const otherClaims = await ClaimRequest.find({
        item: claim.item,
        _id: { $ne: claim._id },
        status: 'pending',
      });

      // 3. Reject all other pending claim requests for this same item in DB
      await ClaimRequest.updateMany(
        { item: claim.item, _id: { $ne: claim._id }, status: 'pending' },
        { status: 'rejected' }
      );

      // 4. Create rejection notifications for other claimers
      for (const otherClaim of otherClaims) {
        await Notification.create({
          user: otherClaim.claimer,
          title: 'Claim Rejected',
          message: `Your claim request for "${itemTitle}" was rejected because another claim was approved.`,
          type: 'claim_rejected',
          relatedClaim: otherClaim._id,
          relatedItem: claim.item,
          itemModel: claim.itemModel,
        });
      }

      // 5. Mark the referenced item as claimed/returned
      if (claim.itemModel === 'Item') {
        await Item.findByIdAndUpdate(claim.item, { status: 'claimed' });
      } else if (claim.itemModel === 'FoundItem') {
        await FoundItem.findByIdAndUpdate(claim.item, { status: 'claimed' });
      }
    } else if (status === 'rejected') {
      // Create rejection notification for the claimer
      await Notification.create({
        user: claim.claimer,
        title: 'Claim Rejected',
        message: `Your claim request for "${itemTitle}" has been rejected.`,
        type: 'claim_rejected',
        relatedClaim: claim._id,
        relatedItem: claim.item,
        itemModel: claim.itemModel,
      });
    }

    res.status(200).json(updatedClaim);
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({ message: 'Server error updating claim status', error: error.message });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  updateClaimStatus,
};
