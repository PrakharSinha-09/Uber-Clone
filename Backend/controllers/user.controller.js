const userModel = require('../models/user.model')
const userService = require('../services/user.service');
const {validationResult} = require('express-validator')
const blacklistTokenModel = require('../models/blacklistToken.model')

module.exports.registerUser=async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    const userExists = await userModel.findOne({ email })
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({ 
        firstname: fullname.firstname, 
        lastname: fullname.lastname,
        email, 
        password: hashedPassword
    });

    const token = user.generateAuthToken()

    res.status(201).json({ token, user });
    
}

module.exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if(!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch) {
        return res.status(401).json({ message: 'Incorrect Password' });
    }

    const token = user.generateAuthToken()

    res.status(200).json({ token, user });
}

module.exports.getUserProfile = async (req, res, next) => {
    const userId = req.user._id

    const user = await userModel.findById(userId);
    
    if(!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
}

module.exports.logoutUser = async (req, res, next) => {

    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    await blacklistTokenModel.create({ token });

    res.status(200).json({ message: 'User logged out'});
}