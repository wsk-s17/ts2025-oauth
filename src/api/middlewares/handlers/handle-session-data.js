export const handleSessionData = (req, res, next) => {
	res.locals.defaultErrorMessage = req.session.defaultErrorMessage;
	delete req.session.defaultErrorMessage;

	res.locals.successMessage = req.session.successMessage;
	delete req.session.successMessage;

	res.locals.violationError = req.session.violationError;
	delete req.session.violationError;

	return next();
};
