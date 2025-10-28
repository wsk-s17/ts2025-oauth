import { v4 } from 'uuid';
import { LOGIN_PATH } from '../../config/routes.js';
import { DefaultSSRError } from '../../utils/errors/default-ssr.error.js';

export const staticUserId = 'solution123';

class UserService {
	users = {
		'solution@example.com': {
			id: staticUserId,
			name: 'solution',
			phone: '+7777777777',
			email: 'solution@example.com',
			password: '$2a$06$Tiig813TbiC/rvEUJJ3Fg.5zt6M2/QvR1fOUDzvU4tJKXU12hwEgm' // password: solution123
		}
	};

	async getUserByEmail(email) {
		const user = this.users[email];

		if (!user)
			throw new DefaultSSRError({
				message: 'Email or password incorrect',
				redirect_url: LOGIN_PATH
			});

		return user;
	}

	getById(id) {
		return Object.values(this.users).find(user => user.id === id);
	}

	findOrCreateUser(data) {
		const user = this.users[data.email];

		if (user)
			return {
				isCreated: false,
				user
			};

		const newUser = {
			...data,
			id: v4()
		};

		this.users[data.email] = newUser;

		return {
			isCreated: true,
			user: newUser
		};
	}
}

export const userService = new UserService();
