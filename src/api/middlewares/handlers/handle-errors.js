import { LOGIN_PATH } from '../../../config/routes.js';
import { DefaultSSRError } from '../../../utils/errors/default-ssr.error.js';
import { ViolationError } from '../../../utils/errors/violation.error.js';

export const handleErrors = (error, req, res, next) => {
	console.log(error);

	if (error instanceof DefaultSSRError) {
		req.session.defaultErrorMessage = error.message;

		return res.redirect(error.redirect_url);
	} else if (error instanceof ViolationError) {
		req.session.violationError = error.errors;

		return res.redirect(error.redirect_url);
	}

	req.session.destroy(error => {
		res.clearCookie('connect.sid');
		res.redirect(LOGIN_PATH);
	});
};
