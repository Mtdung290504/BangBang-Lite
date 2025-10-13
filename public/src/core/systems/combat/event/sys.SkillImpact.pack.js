// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SkillImpactComponent from '../../../components/combat/state/com.SkillImpact.js';
import OnSkillHitManifest from '../../../components/combat/event_container/skill/com.OnSkillHitManifest.js';
import OwnerEIDComponent from '../../../components/combat/state/com.OwnerEID.js';

// Executors
import DealtDamageExecutor from '../../../factory/battle/executors/hit_executors/executor.DealtDamage.js';

// Use type only
import EntityManager from '../../../managers/combat/mgr.Entity.js';

// Components
import ImpactTargetsComponent from '../../../components/combat/state/skill/com.ImpactTargets.js';
import ColliderComponent from '../../../components/physics/com.Collider.js';
import SkillContextComponent from '../../../components/combat/state/skill/com.SkillContext.js';
import TargetFilterComponent from '../../../components/combat/state/skill/com.TargetFilter.js';

const DEBUG = false;
/**
 * - System nhận diện skill ảnh hưởng lên mục tiêu
 * - Xóa các collision target khỏi collider nếu chúng không trong diện bị ảnh hưởng
 */
export const SkillImpactDetectionSystem = defineSystemFactory([ColliderComponent])
	.withProcessor((context, eID, [collider]) => {
		// Nếu collider có on hit manifest, nó là skill cần xác định ảnh hưởng
		if (!context.hasComponent(eID, OnSkillHitManifest)) return;

		// Lấy owner, team và targets của nguồn skill để xử lý impact
		const { ownerEID: projOwnerEID } = context.getComponent(eID, OwnerEIDComponent);
		const { team: selfTeam } = context.getComponent(projOwnerEID, SkillContextComponent);
		const targetFilter = context.getComponent(eID, TargetFilterComponent);

		// Duyệt qua các target đã va chạm với skill
		for (const targetEID of collider.collisionTargets) {
			// Nếu target có khả năng nhận skill mới tính, còn nếu là tường hay kiến trúc thì bỏ qua
			const skillImpactContainer = context.getComponent(targetEID, SkillImpactComponent, false);
			if (!skillImpactContainer) {
				DEBUG && console.log(`SkillImpactor::[${eID}] ignore target::[${targetEID}]`);
				collider.collisionTargets.delete(targetEID);
				continue;
			}

			const { team: targetTeam } = context.getComponent(targetEID, SkillContextComponent);
			const isEnemy = selfTeam !== targetTeam;
			const isSelf = projOwnerEID === targetEID;
			const isAlly = !isEnemy && !isSelf;

			// Nếu có thể đánh trúng kẻ địch
			if (targetFilter.enemy && isEnemy && skillImpactContainer.addImpact(eID, 'enemy')) {
				DEBUG && console.log(`SkillImpactor::[${eID}] impact enemy::[${targetEID}]`);
			}

			// Nếu có đánh trúng đồng minh
			else if (targetFilter.ally && isAlly && skillImpactContainer.addImpact(eID, 'ally')) {
				DEBUG && console.log(`SkillImpactor::[${eID}] impact ally::[${targetEID}]`);
			}

			// Nếu có thể đánh trúng bản thân
			else if (targetFilter.self && isSelf && skillImpactContainer.addImpact(eID, 'self')) {
				DEBUG && console.log(`SkillImpactor::[${eID}] impact owner::[${targetEID}]`);
			}

			// Nếu mục tiêu không trong diện có thể đánh trúng, xóa khỏi targets
			else {
				DEBUG && console.log(`SkillImpactor::[${eID}] ignore target::[${targetEID}]`);
				collider.collisionTargets.delete(targetEID);
			}
		}
	})
	.build();

/**
 * System xử lý các skill đã đánh trúng đối tượng
 */
const SkillImpactHandleSystem = defineSystemFactory([SkillImpactComponent])
	.withProcessor((context, eID, [skillImpact]) => {
		skillImpact.impactors.forEach(({ eID: impactorEID, role }) => {
			// Đạn đã đánh trúng mục tiêu rồi thì bỏ qua mục tiêu đó
			const impactedTargets = context.getComponent(impactorEID, ImpactTargetsComponent);
			if (impactedTargets.has(eID)) return;

			const { ownerEID: sourceEID } = context.getComponent(impactorEID, OwnerEIDComponent);
			const { onHitManifest } = context.getComponent(impactorEID, OnSkillHitManifest);
			const handlers = onHitManifest[role];
			const selfHandler = onHitManifest['self'];

			// Lưu eID của bản thân vào registry của đạn
			impactedTargets.add(eID);

			if (!handlers) return;
			executeActions(context, handlers, sourceEID, impactorEID, eID);

			if (!selfHandler) return;
			executeActions(context, handlers, sourceEID, impactorEID);
		});

		skillImpact.clearImpacts();
	})
	.build();

/**
 * System clean các impactor không còn tồn tại (đã bị xóa)
 */
const CleanImpactorsSystem = defineSystemFactory([SkillImpactComponent])
	.withProcessor((context, _eID, [skillImpact]) => {
		for (const impactorEID of skillImpact.skillImpactEIDs) {
			if (context.hasEntity(impactorEID)) return;

			// Nếu entity không còn tồn tại, loại bỏ khỏi impactor
			skillImpact.skillImpactEIDs.delete(impactorEID);
			console.log('> [CleanImpactorsSystem] Cleaned non-existent impactor:', impactorEID);
		}
	})
	.build();

export { SkillImpactHandleSystem, CleanImpactorsSystem };

/**
 * @param {EntityManager} context
 * @param {import('.types-system/dsl/skills/actions/skill-actions').SkillHitAction[]} actions - Manifest của các action
 * @param {number} sourceEID - Nguồn tạo ra đạn hoặc area damage
 * @param {number} impactorEID - Nguồn gây sát thương, ví dụ: đạn, area damage để tính giảm hoặc damage theo điều kiện
 * @param {number} [targetEID] - Mục tiêu áp dụng, nếu không có thì mặc định áp dụng lên chính mình
 */
function executeActions(context, actions, sourceEID, impactorEID, targetEID) {
	actions.forEach((action) => {
		if (typeof action === 'string') return;

		switch (action.action) {
			case '@apply:damage':
				new DealtDamageExecutor(context, action).exec(sourceEID, impactorEID, targetEID ?? sourceEID);
				break;
			// TODO: Bổ sung executor

			default:
				break;
		}
	});
}
