import { clientService } from './client.service.js';

export const ClientController = {
	getApps: async (req, res) => {
		const apps = clientService.getApps(req.session.user.id);

		return res.render('pages/dashboard/index.ejs', {
			apps
		});
	},
	createAppPage: async (req, res) => {
		return res.render('pages/dashboard/create.ejs');
	},
	createApp: async (req, res) => {
		clientService.createApp(req.body, req.session.user.id);

		return res.redirect('/');
	},
	authorizePage: async (req, res) => {
		const { client, scope, state, code_challenge, code_challenge_method, redirectUri } =
			clientService.authorize(req.query);

		return res.render('pages/dashboard/authorize.ejs', {
			clientId: client.id,
			scope,
			state,
			codeChallenge: code_challenge,
			codeChallengeMethod: code_challenge_method,
			redirectUri
		});
	},
	approve: async (req, res) => {
		const redirectUri = clientService.approve(req.body, req.session.user.id);

		return res.redirect(redirectUri);
	},
	getToken: async (req, res) => {
		try {
			const accessToken = clientService.getToken(req.body, req.headers.authorization);

			return res.json({
				access_token: accessToken
			});
		} catch (error) {
			return res.status(400).json({
				message: error.message
			});
		}
	},
	getUserInfo: async (req, res) => {
		try {
			const user = clientService.getUserInfo(req.headers.authorization);

			return res.json(user);
		} catch (error) {
			return res.status(400).json({
				message: error.message
			});
		}
	}
};
