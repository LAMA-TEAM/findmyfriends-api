import express from 'express';
import cors from 'cors';

import db from './config/database.js';
import routes from './src/routes.js';

db();

const app = express();
app.use(cors('*'));
app.use(express.json());

const PORT = process.env.PORT || 5000;

routes(app);

app.listen(PORT, () => {
    console.log(`✅ http://localhost:${PORT}`);
});