import Player from '../../../../../models/Player.js';
import { renderPlayersView, views, setMapImageView, setReadyState, setTankImageView } from '../../../UIs/roomUI.js';
import { safeArea, asInstanceOf } from '../../../utils/safe-handlers.js';

/**
 * @typedef {import('socket.io-client').Socket} Socket
 */

/**
 * ***Note:*** Hiện tại mới là raw object nhận từ socket, chưa chuyển thành Player
 * @type {{ [playerID: string]: Player }}
 */
let players = {};

/**@type {string[]} */
let readyPlayers = [];

/**@type {string[]} */
let loadedPlayers = [];

let firstInit = true;

export { players, readyPlayers, loadedPlayers, setup, getSandboxPlayers };

/**
 * Lấy room player giả định cho sandbox
 * @param {string} playerName
 * @param {string} sandboxSocketID
 */
function getSandboxPlayers(playerName, sandboxSocketID) {
	return [
		Player.fromJSON({
			socketID: sandboxSocketID,
			name: playerName,
			team: 0,
			using: { tankID: 1 },
		}),
		...[0, 1, 2].map((fakeID) => {
			return Player.fromJSON({
				socketID: (fakeID + 1).toString(),
				name: playerName,
				team: fakeID ? 1 : fakeID,
				using: { tankID: fakeID === 2 ? 1 : 0 },
			});
		}),
	];
}

/**
 * @param {Socket} socket
 */
function setup(socket) {
	socket.on('response:join-failed', (msg) => {
		alert(`Không thể vào room, nguyên nhân: ${msg}`);
		location.href = '/';
	});

	socket.on('dispatch:update-players', (roomData) => {
		// `players` có thể null với response của event `toggle-ready-state`
		players = roomData.players ?? players; // Mới là raw object, chưa chuyển thành `Player`
		for (const playerID in players) {
			const rawPlayer = players[playerID];
			players[playerID] = Player.fromJSON(rawPlayer); // Convert thành Player
		}
		readyPlayers = roomData.readyPlayers ?? readyPlayers;

		// First time connect event, log or do sth in future
		if (firstInit) {
			console.log('> [Socket.RoomHandler.onEvent:join-success] Join room success');
			firstInit = false;
		}

		console.log('> [Socket.RoomHandler.onEvent:update-players] Receive players data in room:', roomData);
		renderPlayersView(players, readyPlayers); // Render danh sách player
		setReadyState(readyPlayers.includes(socket.id ?? '_')); // Đặt trạng thái cho nút sẵn sàng
	});

	socket.on('dispatch:change-map', (mapID) => {
		console.log('> [Socket.RoomHandler.onEvent:change-map] Receive mapID, update current mapID to:', mapID);
		setMapImageView(mapID);
	});

	socket.on('dispatch:change-tank', (tankID) => {
		console.log('> [Socket.RoomHandler.onEvent:change-tank] Receive tankID, update current tankID to:', tankID);
		setTankImageView(tankID);
	});

	// ***Note:*** Debounce in future (Cẩn thận xử lý đoạn vào game rồi mà hàm debounce vẫn kích hoạt)
	views.readyBtn.addEventListener('click', () => {
		console.log('> [Socket.RoomHandler.request:toggle-ready-state] Requested toggle ready state');
		socket.emit('request:toggle-ready-state');
	});

	// ***Note:*** Optimize emit call condition in future, debounce (Cẩn thận xử lý đoạn vào game rồi mà hàm debounce vẫn kích hoạt)
	views._root.addEventListener('click', (e) =>
		safeArea(() => {
			const target = asInstanceOf(e.target, HTMLElement);
			if (!views._isBoundTo(target, 'playerSlots')) return;

			const teamContainer = asInstanceOf(target.closest('.team'), HTMLElement);
			if (target.innerHTML === '' && teamContainer.dataset.team !== players[socket.id ?? '_'].team.toString()) {
				console.log(`> [Socket.RoomHandler.request:change-team]`);
				socket.emit('request:change-team');
			}
		})
	);
}
