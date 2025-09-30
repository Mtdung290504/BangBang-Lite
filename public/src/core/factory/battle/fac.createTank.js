import { storage } from '../../../network/assets_managers/index.js';

// Tank, context & state components
import TankComponent from '../../components/combat/objects/com.Tank.js';
import TankHeadComponent from '../../components/combat/objects/com.TankHead.js';
import SkillContextComponent from '../../components/combat/state/skill/com.SkillContext.js';

// Stats components
import AdditionalAttributesComponent from '../../components/combat/stats/com.AdditionalAttributes.js';
import MovementComponent from '../../components/physics/com.Movement.js';
import ShootingComponent from '../../components/combat/stats/com.Shooting.js';
import SurvivalComponent from '../../components/combat/stats/com.Survival.js';

// Combat stats
import ReceivedDamageComponent from '../../components/combat/state/com.ReceiveDamage.js';
import SkillImpactComponent from '../../components/combat/state/com.SkillImpact.js';

// Display components
import ShadowComponent from '../../components/graphic/com.Shadow.js';
import SpriteComponent from '../../components/graphic/com.Sprite.js';

// Physics components
import ColliderComponent from '../../components/physics/com.Collider.js';
import PositionComponent from '../../components/physics/com.Position.js';
import VelocityComponent from '../../components/physics/com.Velocity.js';

// Input handlers
import InputComponent from '../../components/input/com.Input.js';
import BattleInputManager from '../../managers/input/mgr.BattleInput.js';

// Constants
import { TANK_DEFAULT_SIZE } from '../../../../configs/constants/domain_constants/com.constants.js';
import NetworkPositionComponent from '../../components/network/com.NetworkPosition.js';
import VelocityHistoryComponent from '../../components/network/com.VelocityHistory.js';
import StatusBarComponent from '../../components/graphic/com.Status.js';
import AttackPowerComponent from '../../components/combat/stats/com.AttackPower.js';

// Use type only
import EntityManager from '../../managers/combat/mgr.Entity.js';

/**
 * @type {ReturnType<typeof createAppearPositionGetter> | undefined}
 */
let getAppearPosition = undefined;

/**
 * @param {EntityManager} context
 * @param {number} mapID
 * @param {import('models/public/Player.js').default} player
 * @param {import('.types-system/src/core/combat/faction.js').Faction} faction
 * @param {BattleInputManager} [inputManager]
 */
export default function createTank(context, mapID, player, faction, inputManager) {
	const { tankID, skinID } = player.using;
	const { stats: tankStatsManifest } = storage.getTankManifests(tankID);
	const { 'stat-components': stats } = tankStatsManifest;

	const mapManifest = storage.getMapManifest(mapID);
	if (!mapManifest) throw new Error('> [fac.createTank] mapManifest is undefined???');
	if (!getAppearPosition) getAppearPosition = createAppearPositionGetter(mapManifest['appear-coords']);

	// Create tank entity, if undefined inputManager, create
	const tankEID = context.createEntity();
	inputManager = inputManager ?? new BattleInputManager();

	// Add tank/input components
	const tankComponent = new TankComponent(tankID, skinID, storage.getSpriteKeyBuilder(tankID, skinID));
	context.addComponents(tankEID, [tankComponent, new InputComponent(inputManager)]);

	// Tank physics
	// TODO: Đọc vị trí xuất hiện từ map manifest *Cần đưa logic này lên server, nếu không giữa các client sẽ bị lộn xộn
	// new PositionComponent(...getAppearPosition(player.team)),
	const tankPos = new PositionComponent(200, 200);
	context.addComponents(tankEID, [
		tankPos,

		// Hitbox
		ColliderComponent.fromDSL({
			type: 'circle',
			size: { radius: tankStatsManifest['hitbox-size'] ?? TANK_DEFAULT_SIZE },
		}),

		// Di chuyển
		new MovementComponent(stats['movement-speed'], 0),
		new VelocityComponent(),
	]);

	// Tank stats components
	context.addComponents(tankEID, [
		SurvivalComponent.fromDSL(stats.survival),
		ShootingComponent.fromDSL(stats.shooting),
		AttackPowerComponent.fromDSL(stats['attack-power']),

		// Combat stat components
		new SkillImpactComponent(),
		new ReceivedDamageComponent(),
	]);
	stats.additional && context.addComponent(tankEID, AdditionalAttributesComponent.fromDSL(stats.additional));

	// Đặt render size cho sprite của tank
	const bodySprite = new SpriteComponent(storage.getSprite(tankID, skinID, 'body'));
	let renderRadius = tankStatsManifest['render-size'] ?? TANK_DEFAULT_SIZE;
	const renderSize = { width: renderRadius * 2, height: renderRadius * 2 };

	// *Note: Thay đổi sprite manifest lên tham chiếu gốc tiết kiệm và không gây bug
	bodySprite.resource.manifest['render-size'] = renderSize;

	// Tank graphic components
	context.addComponents(tankEID, [bodySprite, new ShadowComponent(), new StatusBarComponent(faction, player.name)]);

	// Network sync components
	const networkPosition = new NetworkPositionComponent();
	context.addComponents(tankEID, [networkPosition, new VelocityHistoryComponent()]);

	// Lưu headID vào tank, lưu tankID vào head, tạo skill context
	const tankHeadEID = createTankHead(context, tankEID, renderSize);
	const tankHeadAngleRef = context.getComponent(tankHeadEID, MovementComponent);
	tankComponent.tankHeadEID = tankHeadEID;
	context.addComponent(
		tankEID,
		new SkillContextComponent(tankPos, inputManager.mouseState, tankHeadAngleRef, player.team)
	);

	return {
		tankEID,
		//  tankHeadEID,
		inputManager,
		networkPosition,
	};
}

/**
 * @param {EntityManager} context
 * @param {number} tankEID
 * @param {{ width: number, height: number }} renderSize
 */
function createTankHead(context, tankEID, renderSize) {
	const tankHeadEID = context.createEntity();

	const { tankID, skinID } = context.getComponent(tankEID, TankComponent);
	const getParentLayer = context.getComponent(tankEID, SpriteComponent).getLayer;

	context.addComponent(tankHeadEID, new TankHeadComponent(tankEID));
	context.addComponent(tankHeadEID, new MovementComponent(0));

	// *Sử dụng cho render, tại render system không nên biết mối quan hệ giữa tank và head.
	context.addComponent(tankHeadEID, context.getComponent(tankEID, PositionComponent));

	// Đặt render size cho sprite, tương tự với body
	const headSprite = new SpriteComponent(storage.getSprite(tankID, skinID, 'head'), getParentLayer);
	headSprite.resource.manifest['render-size'] = renderSize;

	context.addComponents(tankHeadEID, [
		headSprite,
		// TODO: Bổ sung shadow nếu cần
		new ShadowComponent(),
	]);

	return tankHeadEID;
}

/**
 * Tạo hàm lấy vị trí xuất hiện cho từng team từ dữ liệu "appear-coords".
 *
 * @param {number[][][]} appearCoords - Dữ liệu gốc, dạng [ [ [x,y], ... ], [ [x,y], ... ] ].
 * @returns {(team: 0 | 1) => [x: number, y: number]} Hàm lấy vị trí xuất hiện. Mỗi lần gọi trả về một [x, y], đồng thời đẩy vị trí đó xuống cuối danh sách team.
 */
function createAppearPositionGetter(appearCoords) {
	if (!Array.isArray(appearCoords) || appearCoords.length !== 2) {
		throw new Error('appearCoords phải là mảng 2 chiều [team][positions].');
	}

	/**
	 * Hàm shuffle Fisher–Yates
	 * @param {any[]} arr
	 */
	const shuffle = (arr) => {
		const a = arr.slice();
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	};

	// Random xem team 0 / 1 sẽ dùng tập nào
	const flip = Math.random() < 0.5;
	const teamPositions = [shuffle(appearCoords[flip ? 1 : 0]), shuffle(appearCoords[flip ? 0 : 1])];

	/**
	 * Lấy vị trí xuất hiện cho 1 team.
	 * Mỗi lần gọi: lấy phần tử đầu, rồi đẩy xuống cuối.
	 *
	 * @param {0 | 1} team - Chỉ số team (0 hoặc 1).
	 */
	function getAppearPosition(team) {
		if (team !== 0 && team !== 1) {
			throw new Error('Team phải là 0 hoặc 1.');
		}
		const pos = teamPositions[team].shift();
		teamPositions[team].push(pos);
		return pos;
	}

	return getAppearPosition;
}
