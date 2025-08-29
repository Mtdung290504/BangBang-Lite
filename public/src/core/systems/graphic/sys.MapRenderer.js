import {
	BACKGROUND_DELTA_LAYER,
	SCENES_DELTA_LAYER,
	TANK_DEFAULT_LAYER,
} from '../../../../configs/constants/domain_constants/com.constants.js';
import { RenderContext } from './contexts.js';

const MapRendererFactory = { create };

/**
 * @param {CanvasRenderingContext2D} context2D
 * @param {() => boolean} getDebugState
 * @param {HTMLImageElement} backgroundImage
 * @param {HTMLImageElement} scenesImage
 * @param {import('DSL/map-manifest').MapManifest} mapManifest
 */
function create(context2D, getDebugState, backgroundImage, scenesImage, mapManifest) {
	const sysContext = new RenderContext(context2D, getDebugState);
	const { width: mw, height: mh } = mapManifest.size;

	const BACKGROUND_LAYER = TANK_DEFAULT_LAYER + BACKGROUND_DELTA_LAYER;
	const SCENES_LAYER = TANK_DEFAULT_LAYER + SCENES_DELTA_LAYER;

	/** @param {HTMLImageElement} image */
	const drawMapLayer = (image) => context2D.drawImage(image, 0, 0, mw, mh);

	return {
		process() {
			sysContext.addRenderCallback({ layer: BACKGROUND_LAYER, render: () => drawMapLayer(backgroundImage) });
			sysContext.addRenderCallback({ layer: SCENES_LAYER, render: () => drawMapLayer(scenesImage) });
		},
	};
}

export default MapRendererFactory;
