const Notification = require('../models/Notification');

const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
    res.json({ count: notifications.length, notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findOneAndUpdate({ _id: id, user: req.userId }, { read: true }, { new: true });
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Marked as read', notification: n });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { listNotifications, markRead };
