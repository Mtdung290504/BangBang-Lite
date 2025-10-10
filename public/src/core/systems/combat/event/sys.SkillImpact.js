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

const SkillImpactSystem = defineSystemFactory([SkillImpactComponent])
	.withProcessor((context, eID, [skillImpact]) => {
		skillImpact.impactors.forEach(({ eID: impactorEID, role }) => {
			const { ownerEID: sourceEID } = context.getComponent(impactorEID, OwnerEIDComponent);
			const { onHitManifest } = context.getComponent(impactorEID, OnSkillHitManifest);
			const handlers = onHitManifest[role];
			const selfHandler = onHitManifest['self'];

			if (!handlers) return;
			executeActions(context, handlers, sourceEID, impactorEID, eID);

			if (!selfHandler) return;
			executeActions(context, handlers, sourceEID, impactorEID);
		});

		skillImpact.clearImpacts();
	})
	.build();

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

export { SkillImpactSystem, CleanImpactorsSystem };

/**
 * @param {EntityManager} context
 * @param {import('.types-system/dsl/skills/actions/skill-actions').SkillHitAction[]} actions
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
