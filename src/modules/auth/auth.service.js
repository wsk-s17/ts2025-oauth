import bcrypt from 'bcrypt';
import { LOGIN_PATH, REGISTER_PATH } from '../../config/routes.js';
import { DefaultSSRError } from '../../utils/errors/default-ssr.error.js';
import { userService } from '../user/user.service.js';

const _LOGIN_FIELDS = ['email', 'password'];
const _REGISTER_FIELDS = ['name', 'phone', 'email', 'password'];

class AuthService {
	async login(request) {
		const data = request.body;

		_LOGIN_FIELDS.forEach(field => {
			if (!data[field])
				throw new DefaultSSRError({
					message: `${field} required`,
					redirect_url: LOGIN_PATH
				});
		});

		const user = await userService.getUserByEmail(data.email);

		const isMatchedPassword = await bcrypt.compare(data.password, user.password);

		if (!isMatchedPassword)
			throw new DefaultSSRError({
				message: 'Email or password incorrect',
				redirect_url: LOGIN_PATH
			});

		request.session.user = user;
	}

	async register(request) {
		const data = request.body;

		_REGISTER_FIELDS.forEach(field => {
			if (!data[field])
				throw new DefaultSSRError({
					message: `${field} required`,
					redirect_url: REGISTER_PATH
				});
		});

		const password = await bcrypt.hash(data.password, 6);

		const { isCreated, user } = userService.findOrCreateUser({
			...data,
			password
		});

		if (!isCreated)
			throw new DefaultSSRError({
				message: 'User already exists',
				redirect_url: REGISTER_PATH
			});

		request.session.user = user;
	}

	async logout(request, response) {
		request.session.destroy(err => {
			response.clearCookie('connect.sid');
			response.redirect(LOGIN_PATH);
		});
	}
}

export const authService = new AuthService();
