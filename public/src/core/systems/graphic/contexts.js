/**
 * @typedef {import('.types/Renderable.js').default} Renderable
 */

export class RenderContext {
	/**
	 * Render context bổ sung cho các render system
	 *
	 * @param {CanvasRenderingContext2D} context2D
	 * @param {() => boolean} getDebugState
	 */
	constructor(context2D, getDebugState) {
		this.context2D = context2D;
		this.getDebugState = getDebugState;

		/**@type {Array<Renderable>} */
		this.renderCallbacks = [];
	}

	/**
	 * Thêm callback render vào queue
	 * @param {Renderable} renderable
	 */
	addRenderCallback(renderable) {
		this.renderCallbacks.push(renderable);
	}

	/**
	 * Lấy và xóa tất cả render callbacks
	 */
	flushRenderCallbacks() {
		const callbacks = [...this.renderCallbacks];
		this.renderCallbacks.length = 0;
		return callbacks;
	}
}
