import User from '../models/User.js';
import Invitation from '../models/Invitation.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default class UserController {
    static async register(req, res) {
        const { username, email, password } = req.body;

        if (!username || !email || !password) return res.status(400).json({ message: 'All fields are required' });

        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        if (username.length < 3 || username.length > 20) return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });

        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email' });

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        try {
            const savedUser = await user.save();

            let { password, ...userWithoutPassword } = savedUser._doc;

            res.status(201).json(userWithoutPassword);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: 'All fields are required' });

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User does not exist' });

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        res.status(200).json({ token });
    }

    static async getUser(req, res) {
        const user = await User.findById(req.user._id);

        if (!user) return res.status(400).json({ message: 'User does not exist' });

        let { password, ...userWithoutPassword } = user._doc;
        let { friends, ...userWithoutFriends } = userWithoutPassword;

        res.status(200).json(userWithoutFriends);
    }

    static async getFriends(req, res) {
        const user = await User.findById(req.user._id).populate('friends', '_id email username');

        if (!user) return res.status(400).json({ message: 'User does not exist' });

        let { password, ...userWithoutPassword } = user._doc;

        res.status(200).json(userWithoutPassword.friends);
    }

    static async addFriend(req, res) {
        const { username } = req.body;

        if (!username) return res.status(400).json({ message: 'All fields are required' });
        
        const userWantToAdd = await User.findOne({ username });

        if (!userWantToAdd) return res.status(400).json({ message: 'User does not exist' });

        const user = await User.findById(req.user._id);

        if (!user) return res.status(400).json({ message: 'Token is invalid' });

        if (user.friends.includes(userWantToAdd._id)) return res.status(400).json({ message: 'User is already your friend' });

        const invitationExists = await Invitation.findOne({ $and: [{ from: user._id }, { to: userWantToAdd._id }] });
        if (invitationExists) return res.status(400).json({ message: 'You already sent an invitation' });

        const invitationExists2 = await Invitation.findOne({ $and: [{ from: userWantToAdd._id }, { to: user._id }] });
        if (invitationExists2) return res.status(400).json({ message: 'User already sent you an invitation' });

        const newInvitation = new Invitation({
            from: user._id,
            to: userWantToAdd._id
        });

        try {
            const savedInvitation = await newInvitation.save();

            const { from, to, ...invitationWithoutFromAndTo } = savedInvitation._doc;

            res.status(201).json(invitationWithoutFromAndTo);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}