import { fileURLToPath } from 'url';
import path from 'path';

// Libs
import { StoredDataObject } from 'stored-data-object';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERVER_CONFIG_PATH = path.resolve(__dirname, './server-configs.json');
const SERVER_CONFIG_SCHEMA = {
	PORT: 3000,
	PUBLIC_PATH: 'public',
	ASSETS_PATH: 'assets',
	TOOLS_PATH: 'tools',
	MODELS_PATH: 'models',
};
const SERVER_CONFIG = await StoredDataObject.from(SERVER_CONFIG_PATH, SERVER_CONFIG_SCHEMA)
	.init(SERVER_CONFIG_SCHEMA)
	.build();

export default SERVER_CONFIG;
