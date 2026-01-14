// Mock OTP Service - For Hackathon
// In production, use actual SMS provider like Twilio

const otpStore = new Map(); // In-memory store for MVP

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phone, otp) => {
  // Mock: Log to console (in production, send via SMS API)
  console.log(`[OTP Service] Sending OTP to ${phone}: ${otp}`);
  
  // For demo, we'll accept any OTP starting with a specific digit
  otpStore.set(phone, {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60000), // 10 minutes
  });

  return true;
};

const verifyOTP = (phone, otp) => {
  const storedOTP = otpStore.get(phone);

  if (!storedOTP) {
    return { valid: false, message: 'OTP not found' };
  }

  if (new Date() > storedOTP.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: 'OTP expired' };
  }

  if (storedOTP.code !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  otpStore.delete(phone); // Clear OTP after verification
  return { valid: true, message: 'OTP verified' };
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
};
