import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';
import TextEffectDisplayComponent from '../../../components/combat/state/com.DamagesDisplay.js';
import { easeOut } from '../../../fomulars/anim.js';

/**
 * Cập nhật tọa độ text hiển thị (damage hiển thị bay lên)
 */
const UpdateDamagesDisplaySystem = defineSystemFactory([TextEffectDisplayComponent])
	.withProcessor((_context, _eID, [damageDisplayer]) => {
		const now = Date.now();

		damageDisplayer.textEffects = damageDisplayer.textEffects.filter((damageEffect) => {
			const timePassed = now - damageEffect.startTime;
			const progress = timePassed / damageEffect.duration;

			// Movement
			if (progress < 0.75) {
				switch (damageEffect.displayType) {
					case 'main':
						damageEffect.y -= damageEffect.speed;
						break;
					case 'bonus':
						damageEffect.x -= damageEffect.speed;
						damageEffect.y -= damageEffect.speed;
						break;
					default:
						damageEffect.x += damageEffect.speed;
						damageEffect.y -= damageEffect.speed;
						break;
				}
			}

			// Opacity fade
			if (progress >= 0.8) {
				const fadeProgress = Math.min(1, (progress - 0.8) / 0.2);
				damageEffect.opacity = 1 - easeOut(fadeProgress);
			}

			return timePassed < damageEffect.duration;
		});
	})
	.build();

export default UpdateDamagesDisplaySystem;
