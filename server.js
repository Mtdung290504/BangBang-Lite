// App
import express from 'express';
import cors from 'cors';
import http from 'http';
const app = express();

// Bundler
import esbuild from 'esbuild';
import { readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
const bundledSourceCache = new Map();

// Env
import dotenv from 'dotenv';
dotenv.config();

// Networks
import getWifiIP from './BE/network/getWifiIP.js';
import initSocketServer from './BE/network/socket/initSocket.js';

// Middlewares
import serveStatic from './BE/midwares/serveStatic.js';

// DB & Configs
import { getMapIDs, getTankIDs } from './BE/database/getIDs.js';
import SERVER_CONFIG from './BE/database/configs/index.js';
const { ASSETS_PATH, MODELS_PATH, PORT, PUBLIC_PATH, TOOLS_PATH } = SERVER_CONFIG.data;

// Endpoint for detect host role
app.get('/ping', cors(), (_req, res) => res.status(200).json({ pong: true }));

// Serve map/tank ID
app.get('/ids/:type', async (req, res) => {
	const getter = { tank: getTankIDs, map: getMapIDs }[req.params.type];

	if (!getter) res.status(404);
	else res.status(200).json(await getter());
});

// Bundle route for play mode
if (process.argv.includes('play')) {
	app.get('/index.js', async (req, res) => {
		try {
			const entryFile = `${PUBLIC_PATH}/index.js`;
			const stats = statSync(entryFile);
			const content = readFileSync(entryFile, 'utf8');
			const hash = createHash('md5')
				.update(content + stats.mtime)
				.digest('hex');

			if (bundledSourceCache.has(hash)) {
				return res.type('application/javascript').send(bundledSourceCache.get(hash));
			}

			const result = await esbuild.build({
				entryPoints: [entryFile],
				bundle: true,
				minify: true,
				format: 'esm',
				write: false,
				platform: 'browser',
				external: ['../../../libs/socket.io.js'],
			});

			const bundledCode = result.outputFiles[0].text;
			bundledSourceCache.set(hash, bundledCode);
			res.type('application/javascript').send(bundledCode);
		} catch (error) {
			res.status(500).send('Build error');
		}
	});

	app.use(`/`, serveStatic(PUBLIC_PATH + '/index.html'));
	app.use(`/styles`, serveStatic(PUBLIC_PATH + '/styles'));
} else {
	// Serve static src in dev mode
	app.use(`/`, serveStatic(PUBLIC_PATH));
}

app.use(`/${ASSETS_PATH}/`, serveStatic(ASSETS_PATH));
app.use(`/${TOOLS_PATH}/`, serveStatic(TOOLS_PATH));
app.use(`/${MODELS_PATH}/`, serveStatic(MODELS_PATH));

// Serve static socket.io client lib
app.use('/libs/socket.io.js', serveStatic('./node_modules/socket.io-client/dist/socket.io.esm.min.js'));

// Setup socket.io & start server
const server = http.createServer(app);
const io = initSocketServer(server);
server
	.listen(PORT, () => console.log(`> [Server] Server is up and running on: http://${getWifiIP()}:${PORT}`))
	.on('close', () => io.disconnectSockets(true));
