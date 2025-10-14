/**
 * @typedef {{ viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number }} Viewport
 */

export default class GameRenderContext {
	/**
	 *
	 * @param {CanvasRenderingContext2D} context2D
	 * @param {Viewport} viewport
	 * @param {Object} renderSourceData
	 * @param {number} renderSourceData.mapID
	 * @param {number} renderSourceData.selfTankEID
	 * @param {() => boolean} getDebugState
	 */
	constructor(context2D, viewport, renderSourceData, getDebugState) {
		const { mapID, selfTankEID } = renderSourceData;

		this.context2D = context2D;
		this.viewport = viewport;
		this.mapID = mapID;
		this.selfTankEID = selfTankEID;
		this.getDebugState = getDebugState;
	}
}
