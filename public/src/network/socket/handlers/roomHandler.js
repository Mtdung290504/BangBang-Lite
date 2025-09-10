import Player from '../../../../../models/public/Player.js';
import { SANDBOX_SOCKET_ID } from '../../../../configs/constants/game-system-configs.js';
import { renderPlayersView, views, setMapImageView, setReadyState, setTankImageView } from '../../../UIs/roomUI.js';
import { safeArea, asInstanceOf } from '../../../../utils/safe-handlers.js';

/**
 * @typedef {import('socket.io-client').Socket} Socket
 */

/**
 * ***Note:*** Hiện tại mới là raw object nhận từ socket, chưa chuyển thành Player
 * @type {{ [socketID: string]: Player }}
 */
let players = {};

let playingMapID = 0;

/**@type {string[]} */
let readyPlayers = [];

/**@type {string[]} */
let loadedPlayers = [];

let firstInit = true;

export { players, playingMapID, readyPlayers, loadedPlayers, setup, getSandboxPlayers };

/**
 * @param {Socket} socket
 */
function setup(socket) {
	// Nhận và xử lý event vào room thất bại
	socket.on('response:join-failed', (msg) => {
		alert(`Không thể vào room, nguyên nhân: ${msg}`);
		location.href = '/';
	});

	// Nhận và xử lý event update player từ server
	socket.on('dispatch:update-room-state', (roomData) => {
		players = roomData.players; // Mới là raw object, chưa chuyển thành `Player`
		for (const playerID in players) {
			const rawPlayer = players[playerID];
			players[playerID] = Player.fromJSON(rawPlayer); // Convert thành Player
		}
		readyPlayers = roomData.readyPlayers ?? readyPlayers;

		// First time connect event, log or do sth in future
		if (firstInit) {
			console.log('> [Socket.RoomHandler.onEvent:join-success] Join room success');

			// Đồng bộ mapID trong lần đầu join room
			setMapImageView(roomData.playingMap);
			firstInit = false;
		}

		console.log('> [Socket.RoomHandler.onEvent:update-players] Receive players data in room:', roomData);
		renderPlayersView(players, readyPlayers); // Render danh sách player

		// @ts-expect-error: `socket.id` luôn tồn tại trong ngữ cảnh này
		setReadyState(readyPlayers.includes(socket.id)); // Đặt trạng thái cho nút sẵn sàng
	});

	// Event đổi map
	socket.on('dispatch:change-map', (mapID) => {
		// Chỉ xử lý hiển thị
		console.log('> [Socket.RoomHandler.onEvent:change-map] Receive mapID, update current mapID to:', mapID);
		setMapImageView(mapID);

		// Note: ở đây không xử lý logic thay đổi mapID ở đây mà server đang lưu, nó sẽ gửi event preload về (để chắc chắn không sai lệch)
	});

	// Event đổi tank
	socket.on('dispatch:change-tank', (tankID) => {
		// Chỉ xử lý hiển thị
		console.log('> [Socket.RoomHandler.onEvent:change-tank] Receive tankID, update current tankID to:', tankID);
		setTankImageView(tankID);

		// Note: ở đây không xử lý logic thay đổi tankID ở đây mà server đang lưu, nó sẽ gửi event preload về (để chắc chắn không sai lệch)
	});

	// Server gửi lại list player và map để chắc rằng dữ liệu client đồng bộ
	socket.on('dispatch:all-player-ready', (roomData) => {
		console.log(
			'> [Socket.RoomHandler.onEvent:all-player-ready] Receive players and map data in room for preload:',
			roomData
		);

		// Cập nhật lại players
		players = roomData.players; // Mới là raw object, chưa chuyển thành `Player`
		for (const playerID in players) {
			const rawPlayer = players[playerID];
			players[playerID] = Player.fromJSON(rawPlayer); // Convert thành Player
		}

		// Cập nhật lại map
		playingMapID = roomData.playingMap;

		// Việc cập nhật lại View sẽ bị lỗi do hiện tại giải phóng sau khi toàn bộ player sẵn sàng
		// Trong tương lai nếu chỉ thay đổi display thì đoạn code bên dưới có thể sẽ hữu dụng
		if (false) {
			setMapImageView(playingMapID);

			// Cập nhật view tương tự event `dispatch:update-room-state`
			renderPlayersView(players, readyPlayers);
			// @ts-expect-error: Tương tự event `dispatch:update-room-state`
			setReadyState(readyPlayers.includes(socket.id));
		}
	});

	setupViewEventListeners(socket);
}

/**
 * @param {Socket} socket
 */
function setupViewEventListeners(socket) {
	// Note: Debounce in future (Cẩn thận xử lý đoạn vào game rồi mà hàm debounce vẫn kích hoạt)
	views.readyBtn.addEventListener('click', () => {
		console.log('> [Socket.RoomHandler.request:toggle-ready-state] Requested toggle ready state');
		socket.emit('request:toggle-ready-state');
	});

	// Note: Optimize emit call condition in future, debounce (Cẩn thận xử lý đoạn vào game rồi mà hàm debounce vẫn kích hoạt)
	views._root.addEventListener('click', (e) =>
		safeArea(() => {
			const target = asInstanceOf(e.target, HTMLElement);
			if (!views._isBoundTo(target, 'playerSlots')) return;

			const teamContainer = asInstanceOf(target.closest('.team'), HTMLElement);
			// Note: đoạn players[socket.id] trong thực tế luôn tồn tại, thêm case mặc định và optional để đề phòng
			if (target.innerHTML === '' && teamContainer.dataset.team !== players[socket.id ?? '_']?.team?.toString()) {
				console.log(`> [Socket.RoomHandler.request:change-team]`);
				socket.emit('request:change-team');
			}
		})
	);
}

/**
 * Lấy room player giả định cho sandbox
 *
 * @param {string} playerName
 * @param {number} usingTankID
 *
 * @returns {{ [socketID: string]: Player }}
 */
function getSandboxPlayers(playerName, usingTankID) {
	const players = [
		Player.fromJSON({
			socketID: SANDBOX_SOCKET_ID,
			name: playerName,
			team: 0,
			using: { tankID: usingTankID },
		}),
		...[0, 1, 2].map((fakeID) => {
			return Player.fromJSON({
				socketID: (fakeID + 1).toString(),
				name: playerName,
				team: fakeID ? 1 : 0,
				using: { tankID: fakeID === 2 ? 1 : 0 },
			});
		}),
	];

	// Convert từ mảng sang object với key = socketID
	return Object.fromEntries(players.map((p) => [p.socketID, p]));
}
