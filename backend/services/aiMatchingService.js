/**
 * AI-Powered Item Matching Service
 * Calculates probability-based similarity scores between Lost and Found items.
 */

/**
 * Calculates Jaccard Similarity coefficient between two word sets.
 */
const getJaccardSimilarity = (s1, s2) => {
  const clean = str => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const words1 = clean(s1);
  const words2 = clean(s2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

/**
 * Compares item titles for keyword overlap and substring matches.
 * Weight: 40%
 */
const compareTitles = (t1, t2) => {
  const jaccard = getJaccardSimilarity(t1, t2);
  
  const s1 = t1.toLowerCase();
  const s2 = t2.toLowerCase();
  let substringBonus = 0;
  
  if (s1.includes(s2) || s2.includes(s1)) {
    substringBonus = 0.4;
  }
  
  return Math.min(1.0, jaccard + substringBonus);
};

/**
 * Compares descriptions for keywords, brand matches, and color matches.
 * Weight: 25%
 */
const compareDescriptions = (d1, d2) => {
  const jaccard = getJaccardSimilarity(d1, d2);
  
  const brands = ['apple', 'iphone', 'ipad', 'macbook', 'samsung', 'galaxy', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'sony', 'nintendo', 'nike', 'adidas', 'gucci', 'prada', 'rolex'];
  const colors = ['black', 'white', 'grey', 'gray', 'silver', 'gold', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'orange', 'beige'];
  
  let brandMatch = false;
  let colorMatch = false;
  
  const s1 = d1.toLowerCase();
  const s2 = d2.toLowerCase();
  
  for (const brand of brands) {
    if (s1.includes(brand) && s2.includes(brand)) {
      brandMatch = true;
      break;
    }
  }
  
  for (const color of colors) {
    if (s1.includes(color) && s2.includes(color)) {
      colorMatch = true;
      break;
    }
  }
  
  let score = jaccard;
  if (brandMatch) score += 0.3;
  if (colorMatch) score += 0.3;
  
  return Math.min(1.0, score);
};

/**
 * Compares location strings for proximity signals.
 * Weight: 20%
 */
const compareLocations = (l1, l2) => {
  const s1 = l1.toLowerCase();
  const s2 = l2.toLowerCase();
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  return getJaccardSimilarity(l1, l2);
};

/**
 * Calculates temporal distance and applies exponential decay.
 * Weight: 10%
 */
const compareDates = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const diffTime = Math.abs(new Date(date1) - new Date(date2));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 1.0;
  if (diffDays <= 3) return 0.8;
  if (diffDays <= 7) return 0.6;
  if (diffDays <= 14) return 0.4;
  if (diffDays <= 30) return 0.2;
  return 0.0;
};

/**
 * Classifies the numerical score into descriptive confidence tags.
 */
const getConfidenceLevel = (score) => {
  if (score >= 90) return 'Excellent Match';
  if (score >= 70) return 'Strong Match';
  if (score >= 50) return 'Possible Match';
  return 'Weak Match';
};

/**
 * Matches a specific item against a list of candidates.
 * target: Either Item (Lost) or FoundItem document.
 * candidates: Array of candidate documents (opposite type).
 */
const calculateMatchScore = (target, candidate) => {
  // 1. Category Match (5%)
  const catScore = target.category?.toLowerCase() === candidate.category?.toLowerCase() || 
                    (target.category === 'Lost' && candidate.category === 'Found') || 
                    (target.category === 'Found' && candidate.category === 'Lost') || 
                    (target.category === 'Lost' && candidate.category === 'Lost') ||
                    (target.category === 'Found' && candidate.category === 'Found')
                    ? 1.0 : 0.0;

  // Let's also verify if category names are descriptive (e.g. electronics)
  // Wait! In the listings, category could be "Lost" or "Found" in Item schema,
  // but let's check what categories are used. In item card: "category: Lost / Found" is the item class, 
  // but wait, is there an item type/subcategory? Let's check `Item.js` model:
  // "category: enum: ['Lost', 'Found']".
  // So the category field in the database is the Lost/Found indicator! 
  // Wait, so if an item in Item model has category = "Lost", and another is in FoundItem model, they are opposite!
  // Wait, let's treat the Category Match score as a general check. Since we are doing a cross-dataset match 
  // (Lost Item vs Found Items), they already belong to opposite datasets. So we can just check if categories are correct.
  // Wait, does the item have a subcategory or specific category field like "Laptop", "Keys"?
  // Let's check if there are other fields in the Item schema:
  // Item schema has: `title`, `description`, `category` (enum: ['Lost', 'Found']), `location`, `date`, `status`.
  // Ah! There is no separate subcategory field. So category matches 100% since we cross-compare lost items with found items. That's fine!

  // 2. Title Match (40%)
  const titleScore = compareTitles(target.title || '', candidate.title || '');

  // 3. Description Match (25%)
  const descScore = compareDescriptions(target.description || '', candidate.description || '');

  // 4. Location Match (20%)
  const locScore = compareLocations(target.location || '', candidate.location || '');

  // 5. Date Match (10%)
  const targetDate = target.date || target.dateFound;
  const candidateDate = candidate.date || candidate.dateFound;
  const dateScore = compareDates(targetDate, candidateDate);

  // Weighted Combination
  const totalScore = Math.round(
    titleScore * 40 +
    descScore * 25 +
    locScore * 20 +
    dateScore * 10 +
    catScore * 5
  );

  return {
    score: totalScore,
    confidence: getConfidenceLevel(totalScore),
    breakdown: {
      title: Math.round(titleScore * 100),
      description: Math.round(descScore * 100),
      location: Math.round(locScore * 100),
      date: Math.round(dateScore * 100),
      category: Math.round(catScore * 100)
    }
  };
};

module.exports = {
  calculateMatchScore,
  compareTitles,
  compareDescriptions,
  compareLocations,
  compareDates,
  getConfidenceLevel
};
