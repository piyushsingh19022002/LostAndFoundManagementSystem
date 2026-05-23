const Item = require('../models/Item');
const FoundItem = require('../models/FoundItem');
const { calculateMatchScore } = require('../services/aiMatchingService');

// @desc    Get AI matches for a specific item
// @route   GET /api/matches/:itemId
// @access  Private
const getMatches = async (req, res) => {
  try {
    const { itemId } = req.params;

    // 1. Find the target item in Lost items (Item model) first
    let targetItem = await Item.findById(itemId).populate('user', 'name email');
    let isLost = true;
    let candidates = [];

    if (targetItem) {
      // Target is a Lost Item; we match it against all unclaimed FoundItems
      candidates = await FoundItem.find({ status: 'found' }).populate('user', 'name email');
    } else {
      // Target is not in Lost items, search in FoundItems
      targetItem = await FoundItem.findById(itemId).populate('user', 'name email');
      isLost = false;
      
      if (targetItem) {
        // Target is a Found Item; we match it against all unclaimed LostItems
        candidates = await Item.find({ status: 'lost' }).populate('user', 'name email');
      }
    }

    // 2. Handle item not found in either collection
    if (!targetItem) {
      return res.status(404).json({ message: 'Item report not found' });
    }

    // 3. Compute match scores for all candidates
    const matchesList = candidates
      .map(candidate => {
        const matchResult = calculateMatchScore(targetItem, candidate);
        return {
          item: candidate,
          score: matchResult.score,
          confidence: matchResult.confidence,
          breakdown: matchResult.breakdown
        };
      })
      // Filter out low similarity recommendations (threshold >= 35%)
      .filter(match => match.score >= 35)
      // Sort matches in descending order by score
      .sort((a, b) => b.score - a.score)
      // Limit to top 5 recommendations
      .slice(0, 5);

    res.json({
      targetItem,
      type: isLost ? 'lost' : 'found',
      matches: matchesList
    });
  } catch (error) {
    console.error('Error in getMatches controller:', error);
    res.status(500).json({ message: 'Internal server error calculating matches' });
  }
};

module.exports = {
  getMatches
};
