const User = require('../models/User');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

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

module.exports = { registerUser };

const loginUser = async (req, res) => {
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

    const token = jwt.sign({ userId: user._id, role: user.role }, 
    process.env.Jwt_Secret, { expiresIn: '1h' });

    
    res.status(200).json({ message: 'Login successful', token });
};

module.exports = { registerUser, loginUser };