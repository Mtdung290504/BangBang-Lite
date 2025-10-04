// Manager/contexts
import RenderSystemsManager from '../../core/managers/graphic/mgr.RenderSystem.js';
import { MapRenderContext, RenderContext } from '../../core/systems/graphic/contexts.js';

// Storage
import { storage } from '../../network/assets_managers/index.js';

// Render systems
import MapRenderer from '../../core/systems/graphic/sys.MapRenderer.js';
import SpriteRenderer from '../../core/systems/graphic/sys.SpriteRenderer.js';
import StatusBarRenderer from '../../core/systems/graphic/sys.StatusBarRenderer.js';
import RenderDamagesDisplaySystem from '../../core/systems/graphic/sys.RenderDamagesDisplay.js';

// Use type only
import EntityManager from '../../core/managers/combat/mgr.Entity.js';

/**
 * @param {EntityManager} context
 * @param {CanvasRenderingContext2D} context2D
 * @param {number} mapID
 * @param {() => boolean} getDebugState
 */
export default function setupRenderSystems(context, context2D, mapID, getDebugState) {
	const renderSysMgr = new RenderSystemsManager(context);

	const mapManifest = storage.getMapManifest(mapID);
	if (!mapManifest) throw new Error('> [initializer.setupRenderSystems] mapManifest is undefined???');

	const mapAssets = storage.getMapAssets(mapID);
	if (!mapAssets) throw new Error('> [initializer.setupRenderSystems] mapAssets is undefined???');

	renderSysMgr.register(
		MapRenderer.create(
			context,
			new MapRenderContext(context2D, getDebugState, {
				mapManifest,
				backgroundImage: mapAssets.background,
				scenesImage: mapAssets.scenes ?? undefined,
			})
		)
	);

	// Note: RenderContext chứa render callbacks nên phải tạo riêng cho mỗi system.
	// Dùng chung cũng không lỗi nhưng layer sẽ không được đảm bảo.
	renderSysMgr.register(SpriteRenderer.create(context, new RenderContext(context2D, getDebugState)));
	renderSysMgr.register(StatusBarRenderer.create(context, new RenderContext(context2D, getDebugState)));

	// Damage
	renderSysMgr.register(RenderDamagesDisplaySystem.create(context, new RenderContext(context2D, getDebugState)));

	renderSysMgr.finalize();
	renderSysMgr.initAll();
	console.log('> [initializer.setupRenderSystems] System groups', renderSysMgr.getSystemGroups());

	return renderSysMgr;
}
