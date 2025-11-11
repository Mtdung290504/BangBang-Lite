// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SkillComponent from '../../../components/combat/state/skill/com.SkillComponent.js';
import SkillCooldownComponent from '../../../components/combat/state/skill/com.Cooldown.js';
import SkillRequirementComponent from '../../../components/combat/state/skill/com.SkillRequirement.js';
import AdditionalAttributesComponent from '../../../components/combat/stats/com.AdditionalAttributes.js';
import SurvivalComponent from '../../../components/combat/stats/com.Survival.js';
import ReceivedDamageComponent from '../../../components/combat/state/com.ReceiveDamage.js';

const DEBUG = false;
const SkillRequirementSystem = defineSystemFactory([SkillComponent])
	.withProcessor((context, eID, [skill]) => {
		const cooldownComponent = context.getComponent(eID, SkillCooldownComponent, false);
		// Check cooldown nếu có component
		if (cooldownComponent) {
			const remainingCD = cooldownComponent.remainingCD;
			if (remainingCD > 0) {
				// Lock skill if cooldown !== 0
				DEBUG &&
					console.log(`> [sys.SkillCooldown] Skill::[${eID}] is on cooldown (${remainingCD.toFixed(2)})`);
				skill.available = false;
				return (skill.usable = false);
			}
		}

		const requirement = context.getComponent(eID, SkillRequirementComponent, false);
		DEBUG && console.log('Debug skill requirement:', requirement);

		// Biến lưu các giá trị cần khấu trừ
		let deductEnergy = 0;
		let deductCurrentHP = 0;
		let deductLimitHP = 0;

		let pass = true;
		if (requirement) {
			const { energy, 'current-HP': currentHP, 'limit-HP': limitHP } = requirement.manifest;

			// Check Energy requirement
			if (energy && pass) {
				const additional = context.getComponent(skill.ownerEID, AdditionalAttributesComponent, false);
				if (additional) {
					const { currentEnergyPoint, limitEnergyPoint } = additional;

					if (!energy.unit || energy.unit === 'unit') {
						// Đơn vị unit: trừ trực tiếp
						deductEnergy = energy.amount;
						if (deductEnergy > currentEnergyPoint) {
							pass = false;
							DEBUG &&
								console.log(
									`> [sys.SkillRequirement] Not enough energy: need ${deductEnergy}, have ${currentEnergyPoint}`
								);
						}
					} else if (energy.unit === '%') {
						// Đơn vị %: tính dựa trên limitEnergyPoint
						deductEnergy = Math.ceil((limitEnergyPoint * energy.amount) / 100);
						if (deductEnergy > currentEnergyPoint) {
							pass = false;
							DEBUG &&
								console.log(
									`> [sys.SkillRequirement] Not enough energy: need ${deductEnergy} (${energy.amount}%), have ${currentEnergyPoint}`
								);
						}
					}
				} else {
					pass = false;
					DEBUG && console.log(`> [sys.SkillRequirement] AdditionalAttributesComponent not found`);
				}
			}

			// Check current-HP requirement
			if (currentHP && pass) {
				console.log('Debug, require currentHP:', currentHP);
				const survival = context.getComponent(skill.ownerEID, SurvivalComponent, false);
				if (survival) {
					if (!currentHP.unit || currentHP.unit === 'unit') {
						// Đơn vị unit: trừ trực tiếp
						deductCurrentHP = currentHP.amount;
						if (deductCurrentHP > survival.currentHP) {
							pass = false;
							DEBUG &&
								console.log(
									`> [sys.SkillRequirement] Not enough HP: need ${deductCurrentHP}, have ${survival.currentHP}`
								);
						}
					} else if (currentHP.unit === '%') {
						// Đơn vị %: tính dựa trên currentHP
						deductCurrentHP = Math.ceil((survival.currentHP * currentHP.amount) / 100);
						if (deductCurrentHP > survival.currentHP) {
							pass = false;
							DEBUG &&
								console.log(
									`> [sys.SkillRequirement] Not enough HP: need ${deductCurrentHP} (${currentHP.amount}%), have ${survival.currentHP}`
								);
						}
					}
				} else {
					pass = false;
					DEBUG && console.log(`> [sys.SkillRequirement] SurvivalComponent not found`);
				}
			}

			// Check limit-HP requirement
			if (limitHP && pass) {
				const survival = context.getComponent(skill.ownerEID, SurvivalComponent, false);
				if (survival) {
					if (!limitHP.unit || limitHP.unit === 'unit') {
						// Đơn vị unit: trừ trực tiếp
						deductLimitHP = limitHP.amount;
						if (deductLimitHP > survival.currentHP) {
							pass = false;
							DEBUG &&
								console.log(
									`> [sys.SkillRequirement] Not enough HP for limit: need ${deductLimitHP}, have ${survival.currentHP}`
								);
						}
					} else if (limitHP.unit === '%') {
						// Đơn vị %: tính dựa trên limitHP
						deductLimitHP = Math.ceil((survival.limitHP * limitHP.amount) / 100);
						if (deductLimitHP > survival.currentHP) {
							pass = false;
							DEBUG &&
								console.log(
									`> [sys.SkillRequirement] Not enough HP for limit: need ${deductLimitHP} (${limitHP.amount}%), have ${survival.currentHP}`
								);
						}
					}
				} else {
					pass = false;
					DEBUG && console.log(`> [sys.SkillRequirement] SurvivalComponent not found`);
				}
			}
		}

		// Nếu không pass, lock skill
		if (!pass) {
			skill.available = false;
			return (skill.usable = false);
		}

		skill.available = true;
		if (!skill.usable) return;

		// Sau khi lọc bỏ các điều kiện, tiến hành hồi chiêu
		if (cooldownComponent) cooldownComponent.activateCD();

		// TODO: Khấu trừ tài nguyên ở đây
		// - deductEnergy: số energy cần trừ
		if (deductEnergy) {
			// Hiện tại làm như này cho nhanh để hiệu quả, về sau cần phải sửa lại cơ chế queue như sát thương để tái sử dụng
			context.getComponent(skill.ownerEID, AdditionalAttributesComponent).currentEnergyPoint -= deductEnergy;
		}

		// - deductCurrentHP: số HP cần trừ (từ current-HP requirement)
		if (deductCurrentHP) {
			context.getComponent(skill.ownerEID, ReceivedDamageComponent).damageQueue.push({
				sourceEID: skill.ownerEID,
				damageType: 'true',
				damageValue: deductCurrentHP,
				displayType: 'main',
			});
		}

		// - deductLimitHP: số HP cần trừ (từ limit-HP requirement)
		if (deductLimitHP) {
			context.getComponent(skill.ownerEID, ReceivedDamageComponent).damageQueue.push({
				sourceEID: skill.ownerEID,
				damageType: 'true',
				damageValue: deductLimitHP,
				displayType: 'main',
			});
		}
	})
	.build();

export default SkillRequirementSystem;
