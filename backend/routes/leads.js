const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

// All routes below require a valid login token
router.use(protect);

// ─── GET /api/leads/stats ─────────────────────────────────────────────────────
// Analytics summary (must come BEFORE /:id to avoid route conflict)
router.get('/stats', async (req, res) => {
  try {
    const total     = await Lead.countDocuments();
    const newLeads  = await Lead.countDocuments({ status: 'new' });
    const contacted = await Lead.countDocuments({ status: 'contacted' });
    const converted = await Lead.countDocuments({ status: 'converted' });
    const lost      = await Lead.countDocuments({ status: 'lost' });

    const bySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ total, new: newLeads, contacted, converted, lost, bySource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/leads ───────────────────────────────────────────────────────────
// Get all leads (with optional search, filter, sort)
router.get('/', async (req, res) => {
  try {
    const { status, source, search, sort } = req.query;

    let filter = {};
    if (status)  filter.status = status;
    if (source)  filter.source = source;
    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOrder = { createdAt: -1 }; // newest first by default
    if (sort === 'oldest')   sortOrder = { createdAt: 1 };
    if (sort === 'name')     sortOrder = { name: 1 };

    const leads = await Lead.find(filter).sort(sortOrder);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/leads/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/leads ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, source, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const lead = await Lead.create({ name, email, phone, company, source, status });
    res.status(201).json(lead);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/leads/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/leads/:id/notes ────────────────────────────────────────────────
router.post('/:id/notes', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Note text is required' });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes.push({ text });
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/leads/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
