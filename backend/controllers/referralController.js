const getOpportunity = () => {
  if (global.useFallbackDb) return require('../config/localDb').Opportunity;
  return require('../models/Opportunity');
};

exports.createOpportunity = async (req, res) => {
  try {
    if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only alumni accounts can post opportunities.' });
    }
    const Opportunity = getOpportunity();
    const post = await Opportunity.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(post);
  } catch (e) {
    console.error('createOpportunity error:', e);
    res.status(500).json({ error: 'Opportunity creation failed.' });
  }
};

exports.getAllOpportunities = async (req, res) => {
  try {
    const Opportunity = getOpportunity();
    const list = await Opportunity.find();
    res.status(200).json(Array.isArray(list) ? list : []);
  } catch (e) {
    console.error('getAllOpportunities error:', e);
    res.status(500).json({ error: 'Querying failed.' });
  }
};
