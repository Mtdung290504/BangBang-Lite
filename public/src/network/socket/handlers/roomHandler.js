/**
 * @typedef {import('socket.io-client').Socket} Socket
 */

import Player from '../../../../../models/Player.js';
import { renderPlayersView, roomView, setReadyState } from '../../../UIs/roomUI.js';

let firstInit = true;

/**
 * @type {{
 * 		[playerID: string]: Player
 * }}
 */
let players = {};

/**@type {string[]} */
let readyPlayers = [];

/**@type {string[]} */
let loadedPlayers = [];

/**
 * @param {Socket} socket
 */
export function setup(socket) {
	socket.on('response:join-failed', (msg) => {
		alert(`Không thể vào room, nguyên nhân: ${msg}`);
		location.href = '/';
	});

	socket.on('dispatch:update-players', (roomData) => {
		players = roomData.players ?? players;
		readyPlayers = roomData.readyPlayers ?? readyPlayers;

		// First time connect event, log or do sth in future
		if (firstInit) {
			console.log('> [Socket.RoomHandler.onEvent:join-success] Join room success');
			firstInit = false;
		}

		console.log('> [Socket.RoomHandler.onEvent:update-players] Receive players data in room:', roomData);
		renderPlayersView(players, readyPlayers);
		setReadyState(readyPlayers.includes(socket.id));
	});

	roomView.readyBtn.addEventListener('click', () => {
		console.log('> [Socket.RoomHandler.request:toggle-ready-state] Requested toggle ready state');
		socket.emit('request:toggle-ready-state');
	});
}
