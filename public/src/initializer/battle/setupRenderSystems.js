import { storage } from '../../network/assets_managers/index.js';
import RenderSystemsManager from '../../core/managers/graphic/mgr.RenderSystem.js';
import { MapRenderContext } from '../../core/systems/graphic/contexts.js';
import MapRenderer from '../../core/systems/graphic/sys.MapRenderer.js';
import SpriteRenderer from '../../core/systems/graphic/sys.SpriteRenderer.js';

/**
 * @typedef {import('../../core/managers/combat/mgr.Entity.js').default} EntityManager
 */

/**
 * @param {EntityManager} context
 * @param {CanvasRenderingContext2D} context2D
 * @param {number} mapID
 * @param {() => boolean} getDebugState
 * @param {() => number} getFPS
 */
export default function setupRenderSystems(context, context2D, mapID, getDebugState, getFPS) {
	const renderSystemsManager = new RenderSystemsManager(context);

	const mapManifest = storage.getMapManifest(mapID);
	if (!mapManifest) throw new Error('> [initializer.setupRenderSystems] mapManifest is undefined???');
	const mapAssets = storage.getMapAssets(mapID);
	if (!mapAssets) throw new Error('> [initializer.setupRenderSystems] mapAssets is undefined???');

	renderSystemsManager.register(
		MapRenderer.create(
			new MapRenderContext(context2D, getDebugState, getFPS, {
				mapManifest,
				backgroundImage: mapAssets.background,
				scenesImage: mapAssets.scenes ?? undefined,
			})
		)
	);
	renderSystemsManager.register(SpriteRenderer.create(context, context2D, getDebugState, getFPS));

	renderSystemsManager.finalize();
	renderSystemsManager.initAll();

	return renderSystemsManager;
}
