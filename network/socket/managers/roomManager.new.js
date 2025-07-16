// @ts-check
import Player from '../../../models/Player.js';

/**
 * @typedef {import('socket.io').Socket} Socket
 */

/**
 * @typedef {{
 *      players: { [socketID: string]: Player }
 *      teams: Set<string>[]
 *      readyPlayers: Set<string>
 *      loadedPlayers: Set<string>
 * }} Room
 */

/**
 * Room registry
 * @type {Map<string, Room>}
 */
const rooms = new Map();

// Public functions

/**
 * @param {Socket} socket
 * @param {string} roomID - Thực tế là tên của room luôn
 * @param {string} playerName - Trong tương lai khi phát triển thực tế, thay bằng playerID, query thuộc tính khác từ db hay đâu đó
 */
export async function socketJoinRoom(socket, roomID, playerName) {
	// Block blank roomID
	if (!roomID.trim()) return false;

	const room = rooms.get(roomID) ?? createNewRoom(roomID);

	// Room max 10 player
	if (Object.keys(room.players).length >= 10) return false;

	// If number of player in team #1 < team #0, join to team #1 else to team #0
	const team = room.teams[1].size > room.teams[0].size ? 1 : 0;

	room.players[socket.id] = new Player(socket.id, playerName, team);
	await socket.join(roomID);
	setSocketRoomID(socket, roomID);

	return true;
}

/**
 * @param {Socket} socket
 * @returns {number} The number of players ready for trigger event
 */
export function socketMarkReady(socket) {
	const room = rooms.get(getSocketRoomID(socket));
	if (!room) return;

	room.readyPlayers.add(socket.id);
	return room.readyPlayers.size;
}

/**
 * @param {Socket} socket
 * @returns {void}
 */
export function socketUnmarkReady(socket) {
	const room = rooms.get(getSocketRoomID(socket));
	if (!room) return;
	room.readyPlayers.delete(socket.id);
}

/**
 * @param {Socket} socket
 * @returns {number} The number of players loaded for trigger event
 */
export function socketMarkLoaded(socket) {
	const room = rooms.get(getSocketRoomID(socket));
	if (!room) return;

	room.loadedPlayers.add(socket.id);
	return room.loadedPlayers.size;
}

/**
 * @param {Socket} socket
 * @returns {void}
 */
export function socketLeaveRoom(socket) {
	const roomID = getSocketRoomID(socket);
	const room = rooms.get(roomID);
	if (!room) return;

	delete room.players[socket.id];
	room.readyPlayers.delete(socket.id);
	socket.leave(roomID);

	if (Object.keys(room.players).length === 0) {
		rooms.delete(roomID);
	}
}

// Private functions

/**
 * @param {string} roomID
 * @returns {Room}
 */
function createNewRoom(roomID) {
	const room = {
		players: {},
		teams: [new Set(), new Set()],
		readyPlayers: new Set(),
		loadedPlayers: new Set(),
	};

	rooms.set(roomID, room);
	return room;
}

/**
 * @param {Socket} socket
 * @returns {string | ''}
 */
function getSocketRoomID(socket) {
	return socket.data['roomID'] ?? '';
}

/**
 * @param {Socket} socket
 * @param {string} roomID
 * @returns {void}
 */
function setSocketRoomID(socket, roomID) {
	socket.data['roomID'] = roomID;
}
