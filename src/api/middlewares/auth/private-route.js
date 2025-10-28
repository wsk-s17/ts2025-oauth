import { DASHBOARD_PATH, LOGIN_PATH } from '../../../config/routes.js';
import { wrapHandler } from '../../../utils/wrap-handler.js';

export const privateRoute = wrapHandler(async (req, res, next) => {
	if (req.path.startsWith('/authorize')) {
		req.session.pendingAuth = {
			query: req.query
		};
	}

	if (req.session.user) {
		if (req.path === '/login' || req.path === '/register') return res.redirect(DASHBOARD_PATH);
	} else {
		if (req.path !== '/login' && req.path !== '/register') return res.redirect(LOGIN_PATH);
	}

	return next();
});
