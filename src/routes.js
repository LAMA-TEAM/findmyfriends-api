import UserController from "./controllers/user.controller.js";
import InvitationController from "./controllers/invitation.controller.js";

import isAuth from "./middlewares/isAuth.js";

const routes = (app) => {
    app.post('/auth/register', UserController.register);
    app.post('/auth/login', UserController.login);
    app.get('/auth/user', isAuth, UserController.getUser);
    app.get('/users/friends', isAuth, UserController.getFriends);
    app.post('/users/friends', isAuth, UserController.addFriend);

    app.get('/invitations', isAuth, InvitationController.getAll);
    app.get('/invitations/sended', isAuth, InvitationController.sendedInvitations);
    app.post('/invitations/accept/:id', isAuth, InvitationController.accept);

    app.use((req, res) => {
        res.status(404).send('404 Not Found');
    });
}

export default routes;