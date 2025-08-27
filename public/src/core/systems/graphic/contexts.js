import EntityManager from '../../managers/battle/mgr.Entity.js';

export class RenderContext {
	/**
	 * Render context bổ sung cho các render system
	 *
	 * @param {CanvasRenderingContext2D} context2D
	 * @param {(...args: any[]) => boolean} getDebugState
	 */
	constructor(context2D, getDebugState) {
		this.context2D = context2D;
		this.getDebugState = getDebugState;
	}
}
