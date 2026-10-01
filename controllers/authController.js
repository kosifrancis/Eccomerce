const User = require('../models/User');
const Otp = require('../models/otp');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

function generateDynamicOTP(length = 6) {
    let digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

const registerUser = async (req, res) => {
    const { username, email, password, role, phonenumber, } = req.body;

    if (!username || !email || !password || !role || !phonenumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }   

    if(role !=='buyer' && role !== 'seller') {
        return res.status(400).json({ message: 'Role must be buyer or seller' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role, phonenumber });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', user: { 
        username: user.username,
        email: user.email,
        role: user.role,
        phonenumber: user.phonenumber
     } });
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const jwtSecret = process.env.JWT_SECRET || process.env.Jwt_Secret;
        const token = jwt.sign({ userId: user._id, role: user.role }, 
        jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let otpCode = generateDynamicOTP(6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const existingOtpCode = await Otp.findOne({ userId: user._id });

        if (existingOtpCode) {
            existingOtpCode.otp = otpCode;
            existingOtpCode.expiresAt = expiresAt;
            existingOtpCode.isVerified = false;
            await existingOtpCode.save();
        } else {
            const otpDoc = new Otp({
                userId: user._id,
                otp: otpCode,
                expiresAt,
                isVerified: false
            });
            await otpDoc.save();
        }

        console.log(`Generated OTP for ${email}: ${otpCode}`);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('FORGOT PASSWORD ERROR:', error);
        res.status(500).json({ message: 'Error processing forgot password request', error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpRecord = await Otp.findOne({ userId: user._id });
        if (!otpRecord) {
            return res.status(400).json({ message: 'No OTP found or it has expired' });
        }

        if (new Date() > new Date(otpRecord.expiresAt)) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (String(otpRecord.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        otpRecord.isVerified = true;
        await otpRecord.save();

        const jwtSecret = process.env.JWT_SECRET || process.env.Jwt_Secret;
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email, purpose: 'reset_password' },
            jwtSecret,
            { expiresIn: '15m' }
        );

        res.status(200).json({
            message: 'OTP verified successfully',
            resetToken
        });
    } catch (error) {
        console.error('VERIFY OTP ERROR:', error);
        res.status(500).json({
            message: 'Error verifying OTP',
            error: error.message
        });
    }
};

const setNewPassword = async (req, res) => {
    try {
        const { email, otp, resetToken } = req.body;
        const newPassword = req.body.newPassword || req.body.password;

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' });
        }

        if (typeof newPassword !== 'string' || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        let user = null;
        const jwtSecret = process.env.JWT_SECRET || process.env.Jwt_Secret;

        // 1. Verify via reset token if provided (via body or Authorization header)
        let token = resetToken;
        if (!token && req.headers['authorization']) {
            const authHeader = req.headers['authorization'];
            token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, jwtSecret);
                if (decoded && decoded.userId) {
                    user = await User.findById(decoded.userId);
                }
            } catch (err) {
                return res.status(401).json({ message: 'Invalid or expired reset token' });
            }
        }

        // 2. If token wasn't provided or valid, authenticate via email + OTP or prior OTP verification
        if (!user) {
            if (!email) {
                return res.status(400).json({ message: 'Email is required when reset token is not provided' });
            }

            user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const otpRecord = await Otp.findOne({ userId: user._id });
            if (!otpRecord) {
                return res.status(400).json({ message: 'No OTP verification found. Please request a new OTP.' });
            }

            if (new Date() > new Date(otpRecord.expiresAt)) {
                await Otp.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
            }

            if (otp) {
                if (String(otpRecord.otp).trim() !== String(otp).trim()) {
                    return res.status(400).json({ message: 'Invalid OTP' });
                }
            } else if (!otpRecord.isVerified) {
                return res.status(400).json({ message: 'OTP has not been verified yet' });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Delete OTP records for this user after successful reset
        await Otp.deleteMany({ userId: user._id });

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('SET NEW PASSWORD ERROR:', error);
        res.status(500).json({
            message: 'Error setting new password',
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    verifyOtp,
    setNewPassword,
    resetPassword: setNewPassword
};