/**
 * @typedef {import('.types/src/graphic/graphics').Renderable} _Renderable
 * @typedef {import('.types/dsl/map-manifest').MapManifest} _MapManifest
 */

export class RenderContext {
	/**
	 * Render context bổ sung cho các render system
	 *
	 * @param {CanvasRenderingContext2D} context2D
	 * @param {() => boolean} getDebugState
	 * @param {() => number} getFPS
	 */
	constructor(context2D, getDebugState, getFPS) {
		this.context2D = context2D;
		this.getDebugState = getDebugState;
		this.getFPS = getFPS;

		/**@type {Array<_Renderable>} */
		this.renderCallbacks = [];
	}

	/**
	 * Thêm callback render vào queue
	 * @param {_Renderable} renderable
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

export class MapRenderContext extends RenderContext {
	/**
	 * Render context bổ sung cho map render system
	 *
	 * @param {CanvasRenderingContext2D} context2D
	 * @param {() => boolean} getDebugState
	 * @param {() => number} getFPS
	 *
	 * @param {Object} resource
	 * @param {_MapManifest} resource.mapManifest
	 * @param {HTMLImageElement} [resource.backgroundImage]
	 * @param {HTMLImageElement} [resource.scenesImage]
	 */
	constructor(context2D, getDebugState, getFPS, { mapManifest, backgroundImage, scenesImage }) {
		super(context2D, getDebugState, getFPS);

		this.mapManifest = mapManifest;
		this.backgroundImage = backgroundImage;
		this.scenesImage = scenesImage;
	}
}
