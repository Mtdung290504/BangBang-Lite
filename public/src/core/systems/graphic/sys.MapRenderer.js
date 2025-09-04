import {
	BACKGROUND_DELTA_LAYER,
	SCENES_DELTA_LAYER,
	TANK_DEFAULT_LAYER,
} from '../../../../configs/constants/domain_constants/com.constants.js';
import { MapRenderContext } from './contexts.js';

const MapRenderer = { create };

/**
 * @param {MapRenderContext} sysContext
 */
function create(sysContext) {
	const { context2D, mapManifest, backgroundImage, scenesImage } = sysContext;
	const { width: mw, height: mh } = mapManifest.size;

	const BACKGROUND_LAYER = TANK_DEFAULT_LAYER + BACKGROUND_DELTA_LAYER;
	const SCENES_LAYER = TANK_DEFAULT_LAYER + SCENES_DELTA_LAYER;

	/** @param {HTMLImageElement} [image] */
	const drawMapLayer = (image) => image && context2D.drawImage(image, 0, 0, mw, mh);

	return {
		process() {
			sysContext.addRenderCallback({ layer: BACKGROUND_LAYER, render: () => drawMapLayer(backgroundImage) });
			sysContext.addRenderCallback({ layer: SCENES_LAYER, render: () => drawMapLayer(scenesImage) });
		},
		sysContext,
	};
}

export default MapRenderer;
