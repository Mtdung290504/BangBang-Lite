import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import getWifiIP from './network/getWifiIP.js';
import serveStatic from './midwares/serveStatic.js';
import initSocketServer from './network/socket/initSocket.js';
import { getMapIDs, getTankIDs } from './database/getIDs.js';

dotenv.config();
const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = process.env.PUBLIC_PATH;
const ASSETS_PATH = process.env.ASSETS_PATH;
const TOOLS_PATH = process.env.TOOLS_PATH;
const MODELS_PATH = process.env.MODELS_PATH;

const app = express();
const server = http.createServer(app);

// Endpoint for detect host role
app.get('/ping', cors(), (_req, res) => res.status(200).json({ pong: true }));

// Serve map/tank ID
app.get('/ids/:type', async (req, res) => {
	const getter = { tank: getTankIDs, map: getMapIDs }[req.params.type];

	if (!getter) res.status(404);
	else res.status(200).json(await getter());
});

// Serve static
app.use(`/`, serveStatic(PUBLIC_PATH));
app.use(`/${ASSETS_PATH}/`, serveStatic(ASSETS_PATH));
app.use(`/${TOOLS_PATH}/`, serveStatic(TOOLS_PATH));
app.use(`/${MODELS_PATH}/`, serveStatic(MODELS_PATH));
app.use('/libs/socket.io.js', serveStatic('./node_modules/socket.io-client/dist/socket.io.esm.min.js'));

// Setup socket.io & start server
const io = initSocketServer(
	server
		.listen(PORT, () => console.log(`> [Server] Server is up and running on: http://${getWifiIP()}:${PORT}`))
		.on('close', () => io.disconnectSockets(true))
);
