export class ViolationError extends Error {
	constructor({ message = 'Violation Error', errors, redirect_url }) {
		super(message);

		this.errors = errors;
		this.redirect_url = redirect_url;
	}
}
