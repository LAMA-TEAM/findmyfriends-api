import UserController from "./controllers/user.controller.js";
import InvitationController from "./controllers/invitation.controller.js";
import WaypointController from "./controllers/waypoint.controller.js";

import isAuth from "./middlewares/isAuth.js";

const routes = (app) => {
    app.post('/auth/register', UserController.register);
    app.post('/auth/login', UserController.login);
    app.get('/auth/me', isAuth, UserController.getUser);
    app.get('/users/friends', isAuth, UserController.getFriends);
    app.post('/users/friends', isAuth, UserController.addFriend);

    app.get('/invitations', isAuth, InvitationController.getAll);
    app.post('/invitations', isAuth, InvitationController.create);
    app.get('/invitations/sended', isAuth, InvitationController.sendedInvitations);
    app.post('/invitations/accept/:id', isAuth, InvitationController.accept);

    app.get('/waypoints', isAuth, WaypointController.getAll);
    app.post('/waypoints', isAuth, WaypointController.create);
    app.delete('/waypoints/:id', isAuth, WaypointController.delete);

    app.use((req, res) => {
        res.status(404).json({ message: 'Not found' });
    });
}

export default routes;