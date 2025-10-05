import { fileURLToPath } from 'url';
import path from 'path';

// Libs
import { StoredDataObject } from 'stored-data-object';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERVER_CONFIG_PATH = path.resolve(__dirname, './server-configs.json');

const SERVER_CONFIG = await StoredDataObject.from({
	file: SERVER_CONFIG_PATH,
	schema: {
		PORT: 'number',
		PUBLIC_PATH: 'string',
		ASSETS_PATH: 'string',
		TOOLS_PATH: 'string',
		MODELS_PATH: 'string',
	},
	storageType: 'object',
	initValue: {
		PORT: 3000,
		PUBLIC_PATH: 'public',
		ASSETS_PATH: 'assets',
		TOOLS_PATH: 'tools',
		MODELS_PATH: 'models/public',
	},
});

export default SERVER_CONFIG;
