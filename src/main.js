import { SERVER_CONFIG } from './config/server.config.js';
import { SERVER } from './server/index.js';

const bootstrap = async () => {
	try {
		SERVER.listen(SERVER_CONFIG.PORT, () =>
			console.log(`Server started at http://localhost:${SERVER_CONFIG.PORT}`)
		);
	} catch (error) {
		console.log(error);
	}
};

bootstrap();
