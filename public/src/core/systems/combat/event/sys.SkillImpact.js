// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SkillImpactComponent from '../../../components/combat/state/com.SkillImpact.js';
import OnSkillHitManifest from '../../../components/combat/event_container/skill/com.OnSkillHitManifest.js';
import DealtDamageExecutor from '../../../factory/battle/executors/hit_executors/executor.DealtDamage.js';
import OwnerEIDComponent from '../../../components/combat/state/com.OwnerEID.js';

const SkillImpactSystem = defineSystemFactory([SkillImpactComponent])
	.withProcessor((context, eID, [skillImpact]) => {
		skillImpact.impactors.forEach(({ eID: impactEID, role }) => {
			const { ownerEID: sourceEID } = context.getComponent(impactEID, OwnerEIDComponent);
			const { onHitManifest } = context.getComponent(impactEID, OnSkillHitManifest);
			const handlers = onHitManifest[role];

			if (!handlers) return;
			handlers.forEach((action) => {
				if (typeof action === 'string') return;
				if (action.action === '@apply:damage') new DealtDamageExecutor(context, action).exec(sourceEID, eID);
			});
		});

		skillImpact.clearImpacts();
	})
	.build();

export default SkillImpactSystem;
