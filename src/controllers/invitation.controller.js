import Invitation from "../models/Invitation.js";

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
            const invitations = await Invitation.find({ from: req.user._id, accepted: false }).populate(['from', 'to'], '_id username');

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
}


