export class DefaultSSRError extends Error {
	constructor({ message, redirect_url }) {
		super(message);

		this.redirect_url = redirect_url;
	}
}
