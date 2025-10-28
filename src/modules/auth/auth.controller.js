import { DASHBOARD_PATH } from '../../config/routes.js';
import { authService } from './auth.service.js';

export const AuthController = {
	loginPage: async (req, res) => {
		return res.render('pages/auth/login.ejs');
	},
	login: async (req, res) => {
		await authService.login(req);

		if (req.session.pendingAuth) {
			const query = req.session.pendingAuth.query;
			delete req.session.pendingAuth;

			const formattedQuery = new URLSearchParams(query).toString();
			return res.redirect(`/authorize?${formattedQuery}`);
		}

		return res.redirect(DASHBOARD_PATH);
	},
	registerPage: async (req, res) => {
		return res.render('pages/auth/register.ejs');
	},
	register: async (req, res) => {
		await authService.register(req);

		return res.redirect(DASHBOARD_PATH);
	},
	logout: async (req, res) => {
		await authService.logout(req, res);
	}
};
