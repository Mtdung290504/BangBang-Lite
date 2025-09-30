import { SKILL_EFFECT_LAYER } from '../../../../configs/constants/domain_constants/com.constants.js';
import { TEXT_DAMAGE_FONT_SIZE } from '../../../../configs/constants/domain_constants/sys.constants.js';
import DamagesDisplayComponent from '../../components/combat/state/com.DamagesDisplay.js';
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';
import { RenderContext } from './contexts.js';

const RenderDamagesDisplaySystem = defineSystemFactory([DamagesDisplayComponent], RenderContext)
	.withProcessor((_context, _eID, [{ damageEffects }], sysContext) => {
		sysContext.addRenderCallback({ layer: SKILL_EFFECT_LAYER, render });

		function render() {
			const { context2D } = sysContext;

			damageEffects.forEach((damageEffect) => {
				context2D.save();
				context2D.globalAlpha = damageEffect.opacity;

				context2D.font = `400 ${TEXT_DAMAGE_FONT_SIZE}px "Montserrat", sans-serif`;
				context2D.textAlign = 'center';

				context2D.strokeStyle = 'black';
				context2D.lineWidth = TEXT_DAMAGE_FONT_SIZE / 35; // Điều chỉnh độ dày viền theo font size
				context2D.fillStyle = damageEffect.color;

				for (let i = 0; i < 3; i++) {
					// Vẽ viền đen
					context2D.strokeText(damageEffect.value, damageEffect.x, damageEffect.y);
					// Vẽ chữ màu
					context2D.fillText(damageEffect.value, damageEffect.x, damageEffect.y);
				}

				context2D.restore();
			});
		}
	})
	.build();

export default RenderDamagesDisplaySystem;
