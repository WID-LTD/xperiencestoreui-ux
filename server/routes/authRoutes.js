const express = require('express');
const router = express.Router();
const { loginUser, registerUser, verifyEmail, forgotPassword, resetPassword, updateProfile, changePassword, requestChangePasswordCode, resendVerificationCode, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-code', resendVerificationCode);

router.get('/me', protect, getMe);
router.put('/profile', upload.single('profileImage'), updateProfile);
router.post('/profile/password-code', requestChangePasswordCode);
router.put('/profile/password', changePassword);

module.exports = router;
