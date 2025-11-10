import EntityManager from '../../core/managers/combat/mgr.Entity.js';
import { storage } from '../../network/assets_managers/index.js';

import TankComponent from '../../core/components/combat/objects/com.Tank.js';
import SkillComponent from '../../core/components/combat/state/skill/com.SkillComponent.js';
import TankActiveSkillsComponent from '../../core/components/combat/state/skill/com.TankActiveSkillsComponent.js';
import SkillCooldownComponent from '../../core/components/combat/state/skill/com.Cooldown.js';

// Executor
import CreateProjectileExecutor from '../../core/factory/battle/executors/action_executors/executor.CreateProjectile.js';
import DoTeleportExecutor from '../../core/factory/battle/executors/action_executors/executor.DoTeleport.js';

// Type only
import BaseActionExecutor from '../../core/factory/battle/executors/base/executor.BaseAction.js';
import ChangePhaseExecutor from '../../core/factory/battle/executors/action_executors/executor.ChangePhase.js';
import SkillRequirementComponent from '../../core/components/combat/state/skill/com.SkillRequirement.js';

/**
 * @typedef {{
 * 		SkillCastAction: import('.types-system/dsl/skills/actions/skill-actions').SkillCastAction
 * 		SkillManifest: import('.types-system/dsl/skill-manifest').SkillManifest<number[]>
 * }} Types
 */

/**
 * @param {EntityManager} context
 * @param {number} tankEID
 * @param {number} spSkillID
 */
export default function setupSkill(context, tankEID, spSkillID) {
	if (!storage.spSkillManifests) throw new Error('????');

	const tank = context.getComponent(tankEID, TankComponent);
	const tankManifest = storage.getTankManifests(tank.tankID);

	/**@type {Types['SkillManifest']} */
	const skills = tankManifest.skills;
	const {
		'normal-attack': normalAttackManifest,
		passive,
		s1: s1_manifest,
		s2: s2_manifest,
		ultimate: ultimateManifest,
		phases = [1],
	} = skills;

	const skillContainer = new TankActiveSkillsComponent(tankEID, phases);
	parseSkill(context, skillContainer, 'normal-attack', normalAttackManifest);
	parseSkill(context, skillContainer, 's1', s1_manifest);
	parseSkill(context, skillContainer, 's2', s2_manifest);
	parseSkill(context, skillContainer, 'ultimate', ultimateManifest);
	parseSkill(context, skillContainer, 'sp', storage.spSkillManifests[spSkillID]);

	context.addComponent(tankEID, skillContainer);
}

/**
 * @param {EntityManager} context
 * @param {TankActiveSkillsComponent} skillContainer
 * @param {import('.types-system/dsl/tank-manifest.js').SkillSlot} skillSlot
 * @param {Types['SkillManifest']['normal-attack']} skillManifest - Type là `SkillManifest['normal-attack']` vì các skill khác cũng giống vậy
 */
function parseSkill(context, skillContainer, skillSlot, skillManifest) {
	// Parse các skill chứa actions trực tiếp
	if (skillManifest.type === 'normal' || skillManifest.type === 'stacked') {
		// Create skill and save to skill container
		const skillEID = context.createEntity();
		skillContainer.setSkill(skillEID, skillSlot);

		// Create handlers for skill:
		const skillComponent = new SkillComponent(skillContainer.ownerEID);
		context.addComponent(skillEID, skillComponent);

		if (skillManifest.cooldown) {
			const cooldownComponent = new SkillCooldownComponent(skillManifest.cooldown);
			context.addComponent(skillEID, cooldownComponent);
		}

		if (skillManifest['resource-consumption'])
			context.addComponent(skillEID, new SkillRequirementComponent(skillManifest['resource-consumption']));

		// Có casting method, có thể là bất kỳ action nào
		if ('casting-method' in skillManifest) {
			if (!skillManifest['casting-method']) return console.warn('casting method exist but undefined');

			// Action không khóa mục tiêu
			if (Array.isArray(skillManifest.actions))
				skillComponent.actions.push(...parseSkillCastAction(context, skillManifest.actions));
			// Action khóa mục tiêu
			else {
				// Tạm thời chưa xử lý
				skillManifest.actions;
			}
		}

		// Không có casting-method, chỉ có thể là các action không khóa mục tiêu
		else skillComponent.actions.push(...parseSkillCastAction(context, skillManifest.actions));
	}

	// Parse multi stage skill
	else if (skillManifest.type === 'multi-stage') {
		// TODO: Implement later
	}

	// Parse multi phase skill
	else if (skillManifest.type === 'phased') {
		console.group('phase');
		for (const phase in skillManifest['phases-definition']) {
			console.log(phase);
			if (!Object.hasOwn(skillManifest['phases-definition'], phase)) continue;
			if (isNaN(parseInt(phase))) throw new Error('Định nghĩa cái phase đ gì vậy??? Sao không phải là number?');

			const phaseManifest = skillManifest['phases-definition'][phase];

			// Create skill and save to skill container
			const skillEID = context.createEntity();
			skillContainer.setSkill(skillEID, skillSlot, parseInt(phase));

			// Create handlers for skill:
			const skillComponent = new SkillComponent(skillContainer.ownerEID);
			context.addComponent(skillEID, skillComponent);

			if (phaseManifest.cooldown) {
				const cooldownComponent = new SkillCooldownComponent(phaseManifest.cooldown);
				context.addComponent(skillEID, cooldownComponent);
			}

			if (phaseManifest['resource-consumption'])
				context.addComponent(skillEID, new SkillRequirementComponent(phaseManifest['resource-consumption']));

			// Có casting method, có thể là bất kỳ action nào
			if ('casting-method' in skillManifest) {
				if (!skillManifest['casting-method']) return console.warn('casting method exist but undefined');

				// Action không khóa mục tiêu
				if (Array.isArray(phaseManifest.actions))
					skillComponent.actions.push(...parseSkillCastAction(context, phaseManifest.actions));
				// Action khóa mục tiêu
				else {
					// Tạm thời chưa xử lý
					phaseManifest.actions;
				}
			}

			// @ts-expect-error: Không có casting-method, chỉ có thể là các action không khóa mục tiêu,
			// tuy nhiên không thể narrow type, chưa tìm ra nguyên nhân
			else skillComponent.actions.push(...parseSkillCastAction(context, phaseManifest.actions));
		}
		console.groupEnd();
	}
}

/**
 * @param {EntityManager} context
 * @param {Types['SkillCastAction'][]} skillCastManifest
 */
function parseSkillCastAction(context, skillCastManifest) {
	/** @type {BaseActionExecutor[]} */
	const result = [];

	skillCastManifest.forEach((actionManifest) => {
		if (typeof actionManifest === 'string') return; // Case `implement later`, bỏ qua

		// Các case skill thực sự
		const actionType = actionManifest.action;
		if (actionType === '@create:projectile') result.push(new CreateProjectileExecutor(context, actionManifest));
		if (actionType === '@do:teleport') result.push(new DoTeleportExecutor(context, actionManifest));
		if (actionType === '@do:change-phase') result.push(new ChangePhaseExecutor(context, actionManifest));

		// Các case khác sau này
	});

	return result;
}
