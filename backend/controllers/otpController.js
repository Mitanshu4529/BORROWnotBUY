const Otp = require('../models/Otp');
const User = require('../models/User');

// Send OTP (mock or via Twilio if configured)
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000));

    // If Twilio configured, try sending SMS
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({ body: `Your OTP code: ${code}`, to: phone, from: process.env.TWILIO_PHONE_NUMBER });
      } catch (err) {
        console.warn('Twilio send failed, falling back to mock', err.message);
      }
    }

    const otp = await Otp.create({ phone, code, expiresAt });
    // For mock/dev convenience, return code in response when Twilio not configured
    const resp = { message: 'OTP sent' };
    if (!process.env.TWILIO_ACCOUNT_SID) resp.code = code;
    res.json(resp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'phone and code required' });

    const otp = await Otp.findOne({ phone, code, used: false, expiresAt: { $gt: new Date() } });
    if (!otp) return res.status(400).json({ message: 'Invalid or expired OTP' });

    otp.used = true;
    await otp.save();

    // Optionally return or create user
    const user = await User.findOne({ phone });
    res.json({ message: 'OTP verified', user: user ? { id: user._id, phone: user.phone } : null });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { sendOtp, verifyOtp };
