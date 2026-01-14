const Item = require('../models/Item');
const User = require('../models/User');

// Get all items with location filter
const getItems = async (req, res) => {
  try {
    const { category, latitude, longitude, radius = 50, search } = req.query;

    let query = { status: 'available' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Location-based search
    if (latitude && longitude) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      };
    }

    const items = await Item.find(query)
      .populate('owner', 'name trustScore phone upi')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      message: 'Items retrieved successfully',
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single item details
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name trustScore phone location upi')
      .populate({
        path: 'borrowRequests',
        select: 'borrower status requestDate',
        populate: { path: 'borrower', select: 'name phone trustScore' },
      });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new item listing
const createItem = async (req, res) => {
  try {
    const { name, description, category, condition, maxBorrowDays, address, latitude, longitude } =
      req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description, and category are required' });
    }

    // Ensure owner has UPI configured so they can receive payments
    const owner = await User.findById(req.userId).select('upi name phone');
    if (!owner) return res.status(404).json({ message: 'Owner not found' });
    if (!owner.upi) {
      return res.status(400).json({ message: 'Please add your UPI in profile before listing items to receive payments' });
    }

    const newItem = new Item({
      name,
      description,
      category,
      condition: condition || 'Good',
      owner: req.userId,
      location: {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0],
        address,
      },
      availability: {
        fromDate: new Date(),
        toDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        maxBorrowDays: maxBorrowDays || 14,
      },
    });

    await newItem.save();

    res.status(201).json({
      message: 'Item created successfully',
      item: newItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { description, condition, status, maxBorrowDays } = req.body;

    if (description) item.description = description;
    if (condition) item.condition = condition;
    if (status) item.status = status;
    if (maxBorrowDays) item.availability.maxBorrowDays = maxBorrowDays;

    await item.save();

    res.json({
      message: 'Item updated successfully',
      item,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
