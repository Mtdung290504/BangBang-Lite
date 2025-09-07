import Player from '../../../models/Player.js';
import { getMapIDs, getTankIDs } from '../../../database/getIDs.js';

/**
 * @typedef {import('socket.io').Socket} Socket
 * @typedef {{
 *      players: { [socketID: string]: Player }
 *      teams: Set<string>[]
 *      readyPlayers: Set<string>
 *      loadedPlayers: Set<string>
 * 		playingMap: number
 * }} Room
 */

const mapIDs = await getMapIDs();
const tankIDs = await getTankIDs();

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

/**@type {string | null} */
let hostSocketID = null;

// Public functions

export function getHostSocketID() {
	return hostSocketID;
}

/**
 * Khóa room khi tất cả player sẵn sàng và trận đấu bắt đầu
 * @param {string} roomID
 */
export function lockRoom(roomID) {
	if (rooms.has(roomID)) lockedRooms.add(roomID);
}

/**
 * Lấy dữ liệu room để client render
 *
 * @param {string} roomID
 * @returns {{
 *      players: { [socketID: string]: Player }
 *      readyPlayers: string[]
 * 		playingMap: number
 * } | null} Return null trong trường hợp room đã bị giải tán do không còn ai
 */
export function getRoomData(roomID) {
	const room = rooms.get(roomID);
	if (!room) return null; // Trường hợp room bị xóa khỏi rooms do không còn player nào ở trong

	const { players, readyPlayers, playingMap } = room;
	return { players, readyPlayers: [...readyPlayers], playingMap };
}

/**
 * Hiện là lấy tên, trong tương lai có thể cần thêm ID hay infor gì đó
 *
 * @param {Socket} socket
 * @returns {string | null}
 */
export function getPlayerName(socket) {
	const room = rooms.get(getSocketRoomID(socket));
	if (!room) return null;
	return room.players[socket.id]?.name ?? null;
}

/**
 * ***Note:***
 * - Hiện chưa xử lý sâu lỗi đến mức ném message
 * - Trả về kết quả join thành công hay không ở dạng boolean
 *
 * @param {Socket} socket
 * @param {string} roomID - Thực tế là tên của room
 * @param {string} playerName - Trong tương lai khi phát triển thực tế, thay bằng playerID, query thuộc tính khác từ db hay đâu đó
 * @param {'host' | 'client'} role
 * @returns {Promise<boolean>}
 */
export async function socketJoinRoom(socket, roomID, playerName, role) {
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

	if (role === 'host') hostSocketID = socket.id;

	return true;
}

/**
 * ***Note:***
 * - Hiện chưa xử lý sâu lỗi đến mức ném message
 * - Khi người chơi đã ready hoặc người đó là thành viên duy nhất trong team hoặc team kia đầy, change team sẽ thất bại, return `false`
 *
 * @param {Socket} socket
 * @returns {boolean}
 */
export function socketChangeTeam(socket) {
	const roomID = getSocketRoomID(socket);
	const room = rooms.get(roomID);

	if (!room) return false;
	if (lockedRooms.has(roomID)) return false; // Fails when room is locked

	const player = room.players[socket.id]; // Nếu `roomID` ở trên tồn tại, chắc chắn player là tồn tại

	if (room.readyPlayers.has(socket.id)) return false; // Fails if player is ready
	if (room.teams[player.team].size - 1 <= 0) return false; // Fails if The player is the last player in the room

	const newTeam = player.team === 0 ? 1 : 0;
	if (room.teams[newTeam].size === 5) return false; // Fails if number of new team members are 5

	room.teams[player.team].delete(socket.id); // Delete old team data
	player.team = newTeam; // Change team of player
	room.teams[newTeam].add(socket.id); // Update new team data

	return true;
}

/**
 * Nếu mapID hợp lệ, room tồn tại và đang mở, return `true`
 *
 * @param {string} roomID
 * @param {number} mapID
 * @returns {boolean}
 */
export function socketChangeMap(roomID, mapID) {
	if (!mapIDs.includes(mapID)) return false;

	const room = rooms.get(roomID);
	if (!room) return false;
	if (lockedRooms.has(roomID)) return false; // Fails when room is locked

	room.playingMap = mapID;
	return true;
}

/**
 * Nếu tankID hợp lệ, player thuộc về room, room tồn tại và đang mở, return `true`
 *
 * @param {Socket} socket
 * @param {number} tankID
 * @returns {boolean}
 */
export function socketChangeTank(socket, tankID) {
	if (!tankIDs.includes(tankID)) return false;

	const roomID = getSocketRoomID(socket);
	const room = rooms.get(roomID);
	if (!room) return false;
	if (lockedRooms.has(roomID)) return false; // Fails when room is locked

	const player = room.players[socket.id];
	if (!player) return false;

	player.using.tankID = tankID;
	return true;
}

/**
 * @param {Socket} socket
 * @returns {boolean} If all players are ready and number of player > 1, return true
 */
export function socketToggleReadyState(socket) {
	const room = rooms.get(getSocketRoomID(socket));
	if (!room) return false;

	if (room.readyPlayers.has(socket.id)) {
		room.readyPlayers.delete(socket.id);
		return false; // Nếu có player hủy, không đời nào `All player ready` diễn ra`
	}

	room.readyPlayers.add(socket.id);

	return (
		room.readyPlayers.size > 1 && // Phải trên 1 người chơi sẵn sàng mới tính
		room.readyPlayers.size === Object.keys(room.players).length // Số người chơi sẵn sàng bằng tổng số người trong room
	);
}

/**
 * @param {Socket} socket
 * @returns {boolean} If all players are loaded, return true
 */
export function socketMarkLoaded(socket) {
	const room = rooms.get(getSocketRoomID(socket));
	if (!room) return false;

	room.loadedPlayers.add(socket.id);

	// Không check size > 1 như `socketToggleReadyState` vì không đời nào diễn ra?
	// Chưa chắc, nếu đang load mà nó disconnect thì sao?
	return room.loadedPlayers.size === Object.keys(room.players).length;
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
		lockedRooms.delete(roomID);
		console.log(`> [SocketServer.RoomManager] Room::${roomID} empty, remove`);
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
		playingMap: 0,
	};

	rooms.set(roomID, room);
	console.log(`> [SocketServer.RoomManager] Created Room::${roomID}\n`);
	return room;
}

/**
 * @param {Socket} socket
 * @param {string} roomID
 */
function setSocketRoomID(socket, roomID) {
	socket.data['roomID'] = roomID;
}
