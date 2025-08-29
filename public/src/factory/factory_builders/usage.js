/**
 * Demo sử dụng defineSystemFactory
 */

import EntityManager from '../../core/managers/battle/mgr.Entity.js';
import defineSystemFactory from './defineSystemFactory.js';

class NetworkContext {
	/**
	 * @param {{ id: string, emit: (...args: any) => void }} socket
	 */
	constructor(socket) {
		this.socket = socket;
	}
}

class Position {
	x = 0;
	y = 0;
}

class Velocity {
	dx = 0;
	dy = 0;
}

const context = new EntityManager();

// System với context
const movementSystemFactory = defineSystemFactory([Position, Velocity], NetworkContext)
	.withInit((ctx) => {
		console.log('Init system with socket', ctx.socket.id);
	})
	.withProcessor((/* unuse */ _context, eID, [pos, vel], sysContext) => {
		pos.x += vel.dx;
		pos.y += vel.dy;
		sysContext.socket.emit('entityMove', { eID, pos });
	})
	.withTeardown((ctx) => {
		console.log('Teardown system', ctx.socket.id);
	})
	.build();

// Khi chạy thực tế
const moveSystem = movementSystemFactory.create(context, { id: 'dkkdsdafsasf', emit: () => {} });
moveSystem.init();
moveSystem.process(1, [new Position(), new Velocity()]);

// System không có context
const simpleMovementSystemFactory = defineSystemFactory([Position, Velocity])
	.withInit(() => {
		console.log('Init simple movement system');
	})
	.withProcessor((_context, eID, [pos, vel]) => {
		pos.x += vel.dx;
		pos.y += vel.dy;
		console.log(`Entity ${eID} moved to (${pos.x}, ${pos.y})`);
	})
	.withTeardown(() => {
		console.log('Teardown simple system');
	})
	.build();

const simpleMoveSystem = simpleMovementSystemFactory.create(context);
simpleMoveSystem.init();
simpleMoveSystem.process(1, [new Position(), new Velocity()]);
