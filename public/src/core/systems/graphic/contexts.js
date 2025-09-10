/**
 * @typedef {import('.types-system/src/graphic/graphics').Renderable} _Renderable
 * @typedef {import('.types-system/dsl/map-manifest').MapManifest} _MapManifest
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
	 *
	 * @param {Object} resource
	 * @param {_MapManifest} resource.mapManifest
	 * @param {HTMLImageElement} [resource.backgroundImage]
	 * @param {HTMLImageElement} [resource.scenesImage]
	 */
	constructor(context2D, getDebugState, { mapManifest, backgroundImage, scenesImage }) {
		super(context2D, getDebugState);

		this.mapManifest = mapManifest;
		this.backgroundImage = backgroundImage;
		this.scenesImage = scenesImage;
	}
}
