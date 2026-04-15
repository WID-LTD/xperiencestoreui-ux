const crypto = require('crypto');
const db = require('../config/db');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail, sendTransactionalEmail } = require('../services/emailService');

const AdminLogService = require('../services/adminLogService');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);

        if (user && (await User.matchPassword(password, user.password))) {
            if (!user.is_verified) {
                // Always issue a fresh code so the verification modal has a valid code to submit
                const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
                const freshExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                await User.setVerificationCode(user.id, freshCode, freshExpiry);

                try {
                    await sendVerificationEmail(user.email, freshCode);
                } catch (emailError) {
                    console.error('[LOGIN] Email send failed for unverified user:', emailError.message);
                    return res.status(500).json({
                        message: 'Could not send verification email. Please try again or contact support.',
                        emailError: true
                    });
                }

                return res.status(401).json({
                    message: 'Your account is not verified yet. A new verification code has been sent to your email.',
                    requiresVerification: true,
                    email: user.email
                });
            }

            // Log the login action
            await AdminLogService.logAction(
                user.id, 
                user.name, 
                'LOGIN', 
                'User Account', 
                `Login from ${req.ip}`, 
                req.ip
            );

            res.json({
                _id: user.id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || '',
                profile_image: user.profile_image || '',
                companyName: user.company_name || '',
                token: generateToken(user.id),
                message: 'Logged in successfully'
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, name, email, password, role, companyName } = req.body;

        // Handle name depending on what is sent
        const fullName = name || `${firstName} ${lastName}`;

        const userExists = await User.findByEmail(email);

        // Handle the broken pipeline: user registered but never verified
        if (userExists) {
            if (userExists.is_verified) {
                // Fully registered & verified account — reject duplicate
                return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
            }

            // Unverified account: refresh the verification code and re-send
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            const newExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            await User.setVerificationCode(userExists.id, newCode, newExpiry);

            try {
                await sendVerificationEmail(userExists.email, newCode);
            } catch (emailError) {
                console.error('[REGISTER] Email send failed:', emailError.message);
                return res.status(500).json({
                    message: 'Account found but email delivery failed. Please try again or contact support.',
                    emailError: true
                });
            }

            return res.status(200).json({
                _id: userExists.id,
                email: userExists.email,
                message: 'A new verification code has been sent to your email. Please check your inbox.',
                resent: true
            });
        }

        // New user — generate code and create account
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        const user = await User.create({
            name: fullName,
            email,
            password,
            role: role || 'consumer',
            companyName,
            verificationCode,
            codeExpires
        });

        if (user) {
            try {
                await sendVerificationEmail(user.email, verificationCode);
            } catch (emailError) {
                console.error('[REGISTER] Email send failed for new user:', emailError.message);
                // Delete the incomplete user record so they can retry registration fresh
                await db.query('DELETE FROM users WHERE id = $1', [user.id]);
                return res.status(500).json({
                    message: 'Registration failed: could not send verification email. Please check your email address and try again.'
                });
            }
            res.status(201).json({
                _id: user.id,
                email: user.email,
                message: 'Registration successful. Verification code sent to your email.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(200).json({ message: 'Email already verified' });
        }

        if (user.verification_code !== code || new Date() > new Date(user.code_expires_at)) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        await User.markVerified(email);

        // Send welcome email
        const welcomeContent = `<h1>Welcome to Xperiencestore!</h1><p>Your account has been successfully verified.</p>`;
        await sendTransactionalEmail(email, 'Welcome to Xperiencestore', welcomeContent);

        res.json({
            token: generateToken(user.id),
            _id: user.id,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            profile_image: user.profile_image || '',
            companyName: user.company_name || '',
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({
                _id: user.id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || '',
                profile_image: user.profile_image || '',
                companyName: user.company_name || '',
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Request Password Reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Store the code directly (not hashed) since the user needs to read it
        // We reuse the existing saveResetToken method but pass the code
        await User.saveResetToken(email, resetCode, tokenExpires);

        // Send email with the code
        await sendVerificationEmail(email, resetCode);

        res.json({ message: 'Password reset code sent' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const user = await User.findByEmail(email);

        if (!user || user.reset_token !== code || new Date() > new Date(user.reset_token_expires_at)) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        await User.updatePassword(email, newPassword);

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const { uploadToR2 } = require('../services/uploadService'); // Make sure to import this at top

// ... existing code ...

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        console.log('[UPDATE PROFILE] req.body:', req.body);
        console.log('[UPDATE PROFILE] req.file:', req.file ? 'File present' : 'No file');

        const { id, name, phone, address, city, country, companyName } = req.body;
        let profileImage = null;

        if (req.file) {
            profileImage = await uploadToR2(req.file, 'profiles');
            console.log('[UPDATE PROFILE] R2 upload URL:', profileImage);
        }

        const updatedUser = await User.updateProfile(id, {
            name,
            phone,
            address,
            city,
            country,
            companyName,
            profileImage
        });

        res.json({
            ...updatedUser,
            token: generateToken(updatedUser.id)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Request Password Change Code
// @route   POST /api/auth/profile/password-code
// @access  Private
const requestChangePasswordCode = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // In a real app we would update the user record with the code. 
        // Re-using verification_code column for simplicity or add a new one.
        // Let's reuse verification_code logic BUT we need to save it.
        // Extending User model on the fly or assuming updateProfile handles generic fields? 
        // Better: Update User.js to handle generic updates or specific code update.
        // For now, let's assume we can update `verification_code` via a direct query or helper.

        // Simulating DB update for code - we need to add a method to User model or use a raw query here if needed, 
        // but sticking to User model abstraction is better.
        // Let's assume User.updateCode exists or we create it.
        // Wait, we don't have User.updateCode. Let's use User.query directly if possible or add it.
        // Actually, User.updateProfile might ignore fields not in its list.
        // Let's rely on `User.setVerificationCode(id, code, expires)` which we should add.
        // For this step, I will add the logic assuming the method exists, then I will update User.js model.

        await User.setVerificationCode(id, verificationCode, codeExpires);

        await sendVerificationEmail(user.email, verificationCode);

        res.json({ message: 'Verification code sent to your email.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Change Password
// @route   PUT /api/auth/profile/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { id, currentPassword, newPassword, code } = req.body;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password first
        if (!(await User.matchPassword(currentPassword, user.password))) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        // Verify OTP
        if (user.verification_code !== code || new Date() > new Date(user.code_expires_at)) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        await User.updatePassword(user.email, newPassword);

        // Clear code
        await User.setVerificationCode(id, null, null);

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-code
// @access  Public
const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address.' });
        }

        if (user.is_verified) {
            return res.status(200).json({ message: 'This account is already verified. Please sign in.' });
        }

        // Generate a fresh code with a new 15-minute window
        const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
        const freshExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await User.setVerificationCode(user.id, freshCode, freshExpiry);
        await sendVerificationEmail(user.email, freshCode);

        res.json({ message: 'A new verification code has been sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { loginUser, registerUser, verifyEmail, forgotPassword, resetPassword, updateProfile, changePassword, requestChangePasswordCode, resendVerificationCode, getMe };
