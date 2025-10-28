import cors from 'cors';
import e from 'express';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleErrors } from '../api/middlewares/handlers/handle-errors.js';
import { handleSessionData } from '../api/middlewares/handlers/handle-session-data.js';
import { AuthRouter } from '../api/routes/auth.router.js';
import { ClientRouter } from '../api/routes/client.router.js';
import { SERVER_CONFIG } from '../config/server.config.js';

export const SERVER = e();

SERVER.use(
	e.urlencoded({
		extended: true
	})
);
SERVER.use(e.json());

SERVER.use(cors());

SERVER.use(
	session({
		secret: SERVER_CONFIG.SESSION_SECRET_KEY,
		resave: false,
		saveUninitialized: true
	})
);

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

SERVER.set('view engine', 'ejs');
SERVER.set('views', path.join(dirname, 'views'));

SERVER.use(e.static(path.join(dirname, 'public')));

SERVER.use(handleSessionData);

SERVER.use('/auth', AuthRouter);
SERVER.use('/', ClientRouter);

SERVER.get('/error', (req, res) => res.render('pages/error.ejs'));

SERVER.use(handleErrors);
