import Waypoint from '../models/Waypoint.js';

export default class WaypointController {
    static async getAll(req, res) {
        try {
            const waypoints = await Waypoint.find({ user: req.user._id });
            res.status(200).json(waypoints);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        const { title, latitude, longitude } = req.body;

        const waypoint = new Waypoint({
            title,
            latitude,
            longitude,
            user: req.user._id
        });

        try {
            await waypoint.save();
            res.status(201).json(waypoint);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        const { id } = req.params;

        const waypoint = await Waypoint.findById(id);
        if (!waypoint) return res.status(400).json({ message: 'Waypoint does not exist' });

        if (waypoint.user.toString() !== req.user._id) return res.status(400).json({ message: 'Token is invalid' });

        try {
            await waypoint.delete();
            res.status(200).json({ message: 'Waypoint deleted' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}