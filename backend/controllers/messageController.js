const Message = require('../models/Message');
const ClaimRequest = require('../models/ClaimRequest');

// @desc    Get all messages for a specific claim request (History)
// @route   GET /api/messages/:claimId
// @access  Private
const getMessagesByClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const claim = await ClaimRequest.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    // Verify user authorization: requester must be claimer or owner
    if (claim.claimer.toString() !== req.user.id && claim.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view messages for this claim request' });
    }

    const messages = await Message.find({ claim: claimId })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error retrieving messages', error: error.message });
  }
};

// @desc    Create a new message (REST fallback / verification)
// @route   POST /api/messages
// @access  Private
const createMessage = async (req, res) => {
  try {
    const { claimId, message } = req.body;
    if (!claimId || !message) {
      return res.status(400).json({ message: 'Please add all required fields: claimId and message' });
    }

    const claim = await ClaimRequest.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    // Verify authorization
    const isClaimer = claim.claimer.toString() === req.user.id;
    const isOwner = claim.owner.toString() === req.user.id;
    if (!isClaimer && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to send messages for this claim request' });
    }

    // Resolve receiver automatically
    const receiverId = isClaimer ? claim.owner : claim.claimer;

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      claim: claimId,
      message,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ message: 'Server error creating message', error: error.message });
  }
};

module.exports = {
  getMessagesByClaim,
  createMessage,
};
