import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import { CREATE_APP_PATH } from '../../config/routes.js';
import { DefaultSSRError } from '../../utils/errors/default-ssr.error.js';
import { ViolationError } from '../../utils/errors/violation.error.js';
import { staticUserId, userService } from '../user/user.service.js';

const staticClientId = `cid-123412341234`;
const staticClientSecret = `csec-123443211234`;

class ClientService {
	clients = [
		{
			id: staticClientId,
			secret: staticClientSecret,
			userId: staticUserId,
			name: 'Solution App',
			redirectUri: [
				'http://localhost:5173/login',
				'https://as9012-module_d.local.skill17.com/login',
				'https://vbdf23-module_d.local.skill17.com/login',
				'https://09kiop-module_d.local.skill17.com/login',
				'https://z12asd-module_d.local.skill17.com/login',
				'https://poo812-module_d.local.skill17.com/login',
				'https://frer00-module_d.local.skill17.com/login'
			]
		}
	];
	authCodes = {};

	getApps(userId) {
		return this.clients.filter(client => client.userId === userId);
	}

	createApp(data, userId) {
		const { name, redirectUri } = data;

		if (!name)
			throw new ViolationError({
				errors: {
					name: 'Required'
				},
				redirect_url: CREATE_APP_PATH
			});

		if (!redirectUri)
			throw new ViolationError({
				errors: {
					redirectUris: 'Required'
				},
				redirect_url: CREATE_APP_PATH
			});

		const formattedUri = redirectUri.split(',').map(s => s.trim());

		const clientId = `cid-${v4().split('-')[0]}`;
		const clientSecret = `csec-${v4().split('-')[0]}`;

		this.clients.push({
			id: clientId,
			secret: clientSecret,
			userId,
			name,
			redirectUri: formattedUri
		});
	}

	authorize(data) {
		const {
			response_type,
			client_id,
			scope,
			state,
			code_challenge,
			code_challenge_method,
			redirect_uri
		} = data;

		if (response_type !== 'code')
			throw new DefaultSSRError({
				message: 'Unsupported response type',
				redirect_url: 'error'
			});

		const client = this.clients.find(client => client.id === client_id);

		if (!client)
			throw new DefaultSSRError({
				message: 'Invalid client id',
				redirect_url: 'error'
			});

		const redirectUrl = client.redirectUri.find(uri => uri === redirect_uri);

		if (!redirectUrl)
			throw new DefaultSSRError({
				message: 'Invalid redirect URI',
				redirect_url: 'error'
			});

		return {
			client,
			scope,
			state,
			code_challenge,
			code_challenge_method,
			redirectUri: redirect_uri
		};
	}

	approve(data, userId) {
		const client = this.clients.find(client => client.id === data.client_id);

		if (!client)
			throw new DefaultSSRError({
				message: 'Invalid client id',
				redirect_url: '/error'
			});

		if (data.action !== 'allow') {
			const redirectUri = new URL(data.redirectUri);

			redirectUri.searchParams.set('error', 'access_denied');

			if (data.state) redirectUri.searchParams.set('state', data.state);

			return redirectUri.toString();
		}

		const authCode = `code-${v4()}`;

		this.authCodes[authCode] = {
			clientId: client.id,
			redirectUri: client.redirectUri,
			userId,
			scope: data.scope,
			expiresAt: Date.now() * 300 * 1000,
			codeChallenge: data.code_challenge || null,
			codeChallengeMethod: data.code_challenge_method || null
		};

		const redirectUri = new URL(data.redirectUri);

		redirectUri.searchParams.set('code', authCode);

		if (data.state) redirectUri.searchParams.set('state', data.state);

		return redirectUri.toString();
	}

	getToken(data, token) {
		let clientId, clientSecret;

		if (token && token.startsWith('Basic ')) {
			const buffer = Buffer.from(token.slice('Basic '.length), 'base64').toString();

			[clientId, clientSecret] = buffer.split(':');
		} else {
			clientId = data.client_id;
			clientSecret = data.client_secret;
		}

		const client = this.clients.find(client => client.id === clientId);

		if (!client)
			throw new DefaultSSRError({
				message: 'invalid_client'
			});

		if (client.secret !== clientSecret)
			throw new DefaultSSRError({
				message: 'invalid_client'
			});

		if (data.grant_type !== 'authorization_code')
			throw new DefaultSSRError({
				message: 'unsupported_grant_type'
			});

		const authCode = this.authCodes[data.code];

		if (!authCode)
			throw new DefaultSSRError({
				message: 'invalid_grant'
			});

		if (authCode.clientId !== data.client_id)
			throw new DefaultSSRError({
				message: 'invalid_grant'
			});

		if (Date.now() > authCode.expiresAt) {
			delete this.authCodes[data.code];

			throw new DefaultSSRError({
				message: 'invalid_grant'
			});
		}

		if (authCode.codeChallenge) {
			if (!data.code_verifier)
				throw new DefaultSSRError({
					message: 'invalid_code_verifier'
				});

			if (authCode.codeChallengeMethod === 'S256') {
				const hashed = crypto.createHash('sha256').update(data.code_verifier).digest();

				const base64Url = hashed
					.toString('base64')
					.replace(/\+/g, '-')
					.replace(/\//g, '_')
					.replace(/=+$/, '');

				if (base64Url !== authCode.codeChallenge)
					throw new DefaultSSRError({
						message: 'invalid_grant'
					});
			} else {
				if (data.code_verifier !== authCode.codeChallenge)
					throw new DefaultSSRError({
						message: 'invalid_grant'
					});
			}
		}

		const userId = authCode.userId;

		delete this.authCodes[data.code];

		const accessToken = jwt.sign(
			{
				sub: userId,
				aud: clientId,
				iss: 'https://oauth2-testt2.local.skill17.com',
				scope: authCode.scope
			},
			process.env.JWT_SECRET_KEY || 'test_key',
			{
				expiresIn: '1h'
			}
		);

		return accessToken;
	}

	getUserInfo(token) {
		if (!token || !token.startsWith('Bearer '))
			throw new DefaultSSRError({
				message: 'missing_token'
			});

		const formattedToken = token.slice('Bearer '.length);

		let payload = null;

		try {
			payload = jwt.verify(formattedToken, process.env.JWT_SECRET_KEY || '123');
		} catch (error) {
			throw new DefaultSSRError({
				message: 'invalid_token'
			});
		}

		const user = userService.getById(payload.sub);

		if (!user)
			throw new DefaultSSRError({
				message: 'invalid_token'
			});

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone
		};
	}
}

export const clientService = new ClientService();
