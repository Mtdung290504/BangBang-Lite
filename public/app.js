import BattleInputManager from './src/core/managers/BattleInputManager.js';
import getConnectedSocket from './src/network/socket/getConnectedSocket.js';
import debugVariable from './src/utils/debugVariable.js';

const socket = await getConnectedSocket();
if (!socket) throw new Error('');
debugVariable(socket, {
	fps: 10,
	style: {
		left: null,
		right: '10px',
		color: 'lime',
	},
}).export('socket-debugger');

const inputMgr = new BattleInputManager();
debugVariable(inputMgr).export('input-manager-debugger');
inputMgr.listen();
