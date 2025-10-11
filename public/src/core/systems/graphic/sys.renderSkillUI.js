import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';
import { SelfOnlyRenderContext } from './contexts.js';

// Components
// Skill state
import TankActiveSkillsComponent from '../../components/combat/state/skill/com.TankActiveSkillsComponent.js';
import SkillCooldownComponent from '../../components/combat/state/skill/com.Cooldown.js';
// Status
import AdditionalAttributesComponent from '../../components/combat/stats/com.AdditionalAttributes.js';
import SurvivalComponent from '../../components/combat/stats/com.Survival.js';

// Constants
import {
	SKILL_BOX_BORDER_RADIUS,
	SKILL_BOX_GAP_SIZE,
	SKILL_BOX_SIZE,
	UI_HP_BAR_GRADIENT,
	UI_STATUS_BAR_HEIGHT,
	UI_STATUS_BAR_WIDTH,
	UI_HP_ENERGY_GAP,
	UI_ENERGY_BAR_GRADIENT,
	SKILL_SLOT_LABEL,
} from '../../../../configs/constants/domain_constants/sys.constants.js';
import { UI_DELTA_LAYER } from '../../../../configs/constants/domain_constants/com.constants.js';

// Cấu hình kích thước
const CONFIG = {
	skillSize: SKILL_BOX_SIZE, // Kích thước mỗi ô skill
	skillGap: SKILL_BOX_GAP_SIZE, // Khoảng cách giữa các ô

	statusBarWidth: UI_STATUS_BAR_WIDTH, // Chiều rộng thanh máu
	statusBarHeight: UI_STATUS_BAR_HEIGHT, // Chiều cao thanh máu
	hpBarGap: SKILL_BOX_GAP_SIZE, // Khoảng cách giữa thanh máu và skill

	cornerRadius: SKILL_BOX_BORDER_RADIUS, // Bo góc
};

/**
 * System chỉ render skill UI cho bản thân
 */
const RenderSkillUISystem = defineSystemFactory([], SelfOnlyRenderContext)
	.withProcessor((context, _eID, [], sysContext) => {
		const { context2D, selfEID, camera } = sysContext;
		const skills = context.getComponent(selfEID, TankActiveSkillsComponent);
		const survival = context.getComponent(selfEID, SurvivalComponent);

		const innerWidth = camera.viewportWidth + 2 * camera.viewportX;
		const innerHeight = camera.viewportHeight + camera.viewportY;

		const skillBoxY = innerHeight - SKILL_BOX_GAP_SIZE / 2 - SKILL_BOX_SIZE;
		const totalSkillWidth = CONFIG.skillSize * 4 + CONFIG.skillGap * 3;
		const skillStartX = (innerWidth - totalSkillWidth) / 2;

		// Vị trí thanh trạng thái (bên trái 4 ô skill, sát đáy)
		const statusBarX = skillStartX - CONFIG.statusBarWidth - CONFIG.hpBarGap;
		let statusBarY = innerHeight - CONFIG.statusBarHeight - SKILL_BOX_GAP_SIZE / 2;

		sysContext.addRenderCallback({ layer: UI_DELTA_LAYER + 10, render });

		function render() {
			// Render thanh năng lượng
			const additional = context.getComponent(selfEID, AdditionalAttributesComponent, false);
			if (additional) {
				renderStatusBar(
					context2D,
					statusBarX,
					statusBarY,
					CONFIG.statusBarWidth,
					CONFIG.statusBarHeight,
					additional.currentEnergyPoint,
					additional.limitEnergyPoint,
					UI_ENERGY_BAR_GRADIENT
				);
				statusBarY -= CONFIG.statusBarHeight + UI_HP_ENERGY_GAP;
			}

			// Render thanh HP
			renderStatusBar(
				context2D,
				statusBarX,
				statusBarY,
				CONFIG.statusBarWidth,
				CONFIG.statusBarHeight,
				survival.currentHP,
				survival.limitHP,
				UI_HP_BAR_GRADIENT
			);

			SKILL_SLOT_LABEL.forEach(([slot, label], index) => {
				const x = skillStartX + (CONFIG.skillSize + CONFIG.skillGap) * index;
				const skill = skills.getSkill(slot);
				if (!skill) return;

				const cooldown = context.getComponent(skill, SkillCooldownComponent);

				renderSkillSlot(
					context2D,
					x,
					skillBoxY,
					CONFIG.skillSize,
					{
						image: null,
						cooldown: {
							current: cooldown.remainingCD,
							CD: cooldown.msCD,
						},
					},
					label,
					CONFIG.cornerRadius
				);
			});
		}
	})
	.build();

export default RenderSkillUISystem;

/**
 * Vẽ thanh HP hoặc năng lượng ở skill UI
 *
 * @param {CanvasRenderingContext2D} context2D - Canvas context
 * @param {number} x - Tọa độ X
 * @param {number} y - Tọa độ Y
 * @param {number} width - Chiều rộng thanh HP
 * @param {number} height - Chiều cao thanh HP
 * @param {number} currentValue - HP hiện tại
 * @param {number} limitValue - HP tối đa
 * @param {([offset: number, color: string])[]} gradientConfig
 * @param {number} [borderRadius=2] - Bán kính bo góc
 */
function renderStatusBar(context2D, x, y, width, height, currentValue, limitValue, gradientConfig, borderRadius = 2) {
	// Tính toán % máu
	const hpPercent = Math.max(0, Math.min(1, currentValue / limitValue));
	const hpWidth = width * hpPercent;

	// Vẽ nền thanh máu
	context2D.fillStyle = 'black';
	roundRect(context2D, x, y, width, height, borderRadius, true, false);

	// Vẽ thanh máu với gradient giống hình
	if (hpWidth > 0) {
		const gradient = context2D.createLinearGradient(x, y, x + width, y);
		gradientConfig.forEach(([offset, color]) => gradient.addColorStop(offset, color));
		context2D.fillStyle = gradient;

		context2D.save();
		context2D.beginPath();
		roundRect(context2D, x, y, hpWidth, height, borderRadius, false, false);
		context2D.clip();
		context2D.fillStyle = gradient;
		context2D.fillRect(x, y, hpWidth, height);
		context2D.restore();
	}

	// Vẽ text HP
	context2D.fillStyle = '#003cbdff';
	context2D.font = '14px Arial';
	context2D.textAlign = 'center';
	context2D.textBaseline = 'middle';
	for (let i = 0; i < 3; i++)
		context2D.fillText(`${Math.floor(currentValue)}/${Math.floor(limitValue)}`, x + width / 2, y + height / 2 + 2);
	context2D.shadowBlur = 0;
}

/**
 * Vẽ một ô skill với cooldown radial
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Tọa độ X
 * @param {number} y - Tọa độ Y
 * @param {number} size - Kích thước ô skill (vuông)
 * @param {Object} skill - Dữ liệu skill
 * @param {HTMLImageElement | null} skill.image - Hình ảnh skill
 * @param {Object} skill.cooldown - Thông tin cooldown
 * @param {number} skill.cooldown.current - Thời gian cooldown hiện tại (giây)
 * @param {number} skill.cooldown.CD - Thời gian cooldown tối đa (giây)
 * @param {string} keyLabel - Label phím (Q, R, E, SPACE)
 * @param {number} radius - Bán kính bo góc
 */
function renderSkillSlot(ctx, x, y, size, skill, keyLabel, radius) {
	const borderWidth = 3;

	// Vẽ hình ảnh skill hoặc vùng xám
	if (skill.image && skill.image instanceof HTMLImageElement) {
		ctx.save();
		ctx.beginPath();
		roundRect(
			ctx,
			x + borderWidth,
			y + borderWidth,
			size - borderWidth * 2,
			size - borderWidth * 2,
			radius - 2,
			false,
			false
		);
		ctx.clip();
		ctx.drawImage(skill.image, x + borderWidth, y + borderWidth, size - borderWidth * 2, size - borderWidth * 2);
		ctx.restore();
	} else {
		// Vùng tối nếu không có hình
		ctx.fillStyle = 'rgba(0, 0, 0, .4)';
		roundRect(
			ctx,
			x + borderWidth,
			y + borderWidth,
			size - borderWidth * 2,
			size - borderWidth * 2,
			radius - 2,
			true,
			false
		);
	}

	// Vẽ overlay cooldown theo kiểu radial (xoay vòng)
	if (skill.cooldown && skill.cooldown.current > 0) {
		const cdPercent = 1 - skill.cooldown.current / skill.cooldown.CD;

		ctx.save();
		ctx.beginPath();
		roundRect(ctx, x, y, size, size, radius, false, false);
		ctx.clip();

		// Vẽ phần sáng (radial cooldown)
		const centerX = x + size / 2;
		const centerY = y + size / 2;
		const startAngle = -Math.PI / 2; // Bắt đầu từ trên cùng
		const endAngle = startAngle + Math.PI * 2 * cdPercent;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.arc(centerX, centerY, size, endAngle, startAngle);
		ctx.closePath();
		ctx.fill();

		ctx.restore();

		// Hiển thị số giây còn lại
		ctx.fillStyle = '#ffffff';
		ctx.font = 'Bold 17px Times New Roman';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
		ctx.shadowBlur = 2;
		ctx.fillText(skill.cooldown.current.toFixed(1), centerX, centerY);
		ctx.shadowBlur = 0;
	}

	// Vẽ viền ô skill
	const isReady = !skill.cooldown || skill.cooldown.current === 0;
	ctx.strokeStyle = isReady ? 'gold' : '#ffffffff';
	ctx.lineWidth = borderWidth;
	roundRect(ctx, x, y, size, size, radius, false, true);

	// Vẽ label phím ở góc phải trên
	ctx.fillStyle = '#ffffff';
	ctx.font = `bold ${keyLabel === 'SPACE' ? '10' : '15'}px Arial`;
	ctx.textAlign = 'right';
	ctx.textBaseline = 'top';
	ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	ctx.shadowBlur = 3;
	ctx.fillText(keyLabel, x + size - 5, y + 5 + (keyLabel === 'SPACE' ? 2.5 : 0));
	ctx.shadowBlur = 0;
}

/**
 * Hàm hỗ trợ vẽ hình chữ nhật bo góc
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @param {boolean} fill
 * @param {boolean} stroke
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();

	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
}
