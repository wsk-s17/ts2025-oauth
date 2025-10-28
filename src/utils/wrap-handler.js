export const wrapHandler = fn => {
	return (req, res, next) => fn(req, res, next).catch(next);
};
