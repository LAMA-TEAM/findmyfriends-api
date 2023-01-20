import Invitation from "../models/Invitation.js";
import User from "../models/User.js";

export default class InvitationController {
    static async getAll(req, res) {
        try {
            const invitations = await Invitation.find({ to: req.user._id, accepted: false }).populate([{ path: 'from', select: '_id username' }]).select(['-to']);
            res.status(200).json(invitations);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async sendedInvitations(req, res) {
        try {
            const invitations = await Invitation.find({ from: req.user._id, accepted: false }).populate({
                path: 'to',
                select: '_id username'
            }).populate({
                path: 'from',
                select: '_id username'
            });

            res.status(200).json(invitations);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async accept(req, res) {
        const { id } = req.params;

        const invitation = await Invitation.findById(id);
        if (!invitation) return res.status(400).json({ message: 'Invitation does not exist' });

        if (invitation.to.toString() !== req.user._id) return res.status(400).json({ message: 'Token is invalid' });

        if (invitation.accepted) return res.status(400).json({ message: 'Invitation is already accepted' });

        invitation.accepted = true;

        try {
            await invitation.save();

            const user = await User.findById(req.user._id);
            const userWantToAdd = await User.findById(invitation.from);

            user.friends.push(userWantToAdd._id);
            userWantToAdd.friends.push(user._id);

            await user.save();
            await userWantToAdd.save();

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        const { username } = req.body;

        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ message: 'User does not exist' });

        if (user._id.toString() === req.user._id) return res.status(400).json({ message: 'You can not add yourself' });

        const invitation = await Invitation.findOne({ from: req.user._id, to: user._id });

        if (invitation) return res.status(400).json({ message: 'Invitation already exists' });

        const newInvitation = new Invitation({
            from: req.user._id,
            to: user._id
        });

        try {
            await newInvitation.save();

            res.status(201).json({ message: 'Invitation created' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}


