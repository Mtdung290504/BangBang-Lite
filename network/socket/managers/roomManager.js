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

/**
 * Locked room ID
 * @type {Set<string>}
 */
const lockedRooms = new Set();

// Public functions

/**
 * @param {string} roomID
 */
export function lockRoom(roomID) {
	if (rooms.has(roomID)) lockedRooms.add(roomID);
}

/**
 * @param {string} roomID
 * @returns {{
 *      players: { [socketID: string]: Player }
 *      readyPlayers: string[]
 * } | null} Return null trong trường hợp room đã bị giải tán do không còn ai
 */
export function getRoomData(roomID) {
	const room = rooms.get(roomID);
	if (!room) return null; // Trường hợp room bị xóa khỏi rooms do không còn player nào ở trong

	const { players, readyPlayers } = room;
	return { players, readyPlayers: [...readyPlayers] };
}

/**
 * @param {Socket} socket
 * @returns {string | null}
 */
export function getPlayerName(socket) {
	const room = rooms.get(getSocketRoomID(socket));
	if (!room) return null;
	return room.players[socket.id]?.name ?? null;
}

/**
 * @param {Socket} socket
 * @param {string} roomID - Thực tế là tên của room luôn
 * @param {string} playerName - Trong tương lai khi phát triển thực tế, thay bằng playerID, query thuộc tính khác từ db hay đâu đó
 * @returns {Promise<boolean>}
 */
export async function socketJoinRoom(socket, roomID, playerName) {
	// Block blank roomID, invalid name or join to locked room
	if (!roomID.trim() || lockedRooms.has(roomID) || !playerName.trim()) return false;

	const room = rooms.get(roomID) ?? createNewRoom(roomID);

	// Room max 10 player
	if (Object.keys(room.players).length >= 10) return false;

	// If number of player in team #1 < team #0, join to team #1 else to team #0
	const team = room.teams[1].size < room.teams[0].size ? 1 : 0;

	room.players[socket.id] = new Player(socket.id, playerName, team);
	room.teams[team].add(socket.id);

	await socket.join(roomID);
	setSocketRoomID(socket, roomID);

	return true;
}

/**
 * @param {Socket} socket
 * @returns {boolean} If all players are ready, return true
 */
export function socketToggleReadyState(socket) {
	const room = rooms.get(getSocketRoomID(socket));
	if (!room) return false;

	if (room.readyPlayers.has(socket.id)) {
		room.readyPlayers.delete(socket.id);
		return false; // Nếu có player hủy, không đời nào `All player ready` diễn ra`
	}

	room.readyPlayers.add(socket.id);
	return room.readyPlayers.size === Object.keys(room.players).length; // All player ready
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

	const player = room.players[socket.id];
	if (player) room.teams[player.team].delete(socket.id);

	delete room.players[socket.id];
	room.readyPlayers.delete(socket.id);
	room.loadedPlayers.delete(socket.id);

	socket.leave(roomID);
	delete socket.data['roomID'];

	if (Object.keys(room.players).length === 0) {
		rooms.delete(roomID);
		console.log(`> [SocketServer.RoomManager] Room::${roomID} empty, clear room`);
	}
}

/**
 * @param {Socket} socket
 * @returns {string | ''}
 */
export function getSocketRoomID(socket) {
	return socket.data['roomID'] ?? '';
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
	console.log(`> [SocketServer.RoomManager] Created Room::${roomID}\n`);
	return room;
}

/**
 * @param {Socket} socket
 * @param {string} roomID
 * @returns {void}
 */
function setSocketRoomID(socket, roomID) {
	socket.data['roomID'] = roomID;
}
