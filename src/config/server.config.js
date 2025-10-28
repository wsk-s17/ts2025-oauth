import 'dotenv/config';

export const SERVER_CONFIG = {
	PORT: process.env.SERVER_PORT || 7000,
	SESSION_SECRET_KEY: process.env.SERVER_SESSION_SECRET_KEY || 'test_key'
};
