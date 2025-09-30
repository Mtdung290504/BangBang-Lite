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
				for (let i = 0; i < 2; i++) {
					context2D.save();
					context2D.globalAlpha = damageEffect.opacity;

					// Vẽ viền đen
					context2D.font = `540 ${TEXT_DAMAGE_FONT_SIZE}px "Montserrat", sans-serif`;
					context2D.textAlign = 'center';
					context2D.strokeStyle = 'black';
					context2D.lineWidth = TEXT_DAMAGE_FONT_SIZE / 28; // Điều chỉnh độ dày viền theo font size
					context2D.strokeText(damageEffect.value, damageEffect.x, damageEffect.y);

					// Vẽ chữ màu
					context2D.fillStyle = damageEffect.color;
					context2D.fillText(damageEffect.value, damageEffect.x, damageEffect.y);
					context2D.restore();
				}
			});
		}
	})
	.build();

export default RenderDamagesDisplaySystem;
