// Location-based search controller
const Item = require('../models/Item');
const User = require('../models/User');

const getNearbyItems = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, category } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    let query = {
      status: 'available',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      },
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    const items = await Item.find(query)
      .populate('owner', 'name trustScore phone')
      .limit(20);

    res.json({
      message: 'Nearby items retrieved',
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getNearbyUsers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    const userId = req.user?.userId; // Get current user from auth middleware

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Find users near the given location (default 10km radius)
    const nearbyUsers = await User.find({
      _id: { $ne: userId }, // Exclude current user
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      },
    })
      .select('name phone trustScore location')
      .limit(50);

    res.json({
      message: 'Nearby users retrieved',
      count: nearbyUsers.length,
      radius: radius,
      users: nearbyUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNearbyItems,
  getNearbyUsers,
};
