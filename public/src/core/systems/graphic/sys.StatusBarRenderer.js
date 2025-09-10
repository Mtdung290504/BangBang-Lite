// System builder and context
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';
import { RenderContext } from './contexts.js';

// Components
import PositionComponent from '../../components/physics/com.Position.js';
import StatusBarComponent from '../../components/graphic/com.Status.js';
import SurvivalComponent from '../../components/combat/stats/com.Survival.js';

// Constants
import {
	ENERGY_BAR_BORDER_RADIUS,
	ENERGY_BAR_BORDER_WIDTH,
	ENERGY_BAR_HEIGHT,
	HP_BAR_BORDER_RADIUS,
	HP_BAR_BORDER_WIDTH,
	HP_BAR_HEIGHT,
	HP_BAR_WIDTH,
	STATUS_BAR_COLORS,
	STATUS_BAR_FONT_SIZE,
} from '../../../../configs/constants/domain_constants/sys.constants.js';
import { TANK_DEFAULT_LAYER } from '../../../../configs/constants/domain_constants/com.constants.js';

import AdditionalAttributesComponent from '../../components/combat/stats/com.AdditionalAttributes.js';
import SpriteComponent from '../../components/graphic/com.Sprite.js';

const StatusBarRenderer = defineSystemFactory([StatusBarComponent, PositionComponent], RenderContext)
	.withProcessor((context, eID, [status, pos], sysContext) => {
		const survival = context.getComponent(eID, SurvivalComponent);
		const additional = context.getComponent(eID, AdditionalAttributesComponent, false);
		const { resource } = context.getComponent(eID, SpriteComponent);
		const color = STATUS_BAR_COLORS[status.faction];

		sysContext.addRenderCallback({ layer: TANK_DEFAULT_LAYER, render });

		function render() {
			const { context2D } = sysContext;

			for (let i = 0; i < 2; i++) {
				// @ts-expect-error: render-size luôn tồn tại
				let [xPos, yPos] = renderHealthBar(context2D, survival, pos, resource.manifest['render-size'], color);
				// Nếu có năng lượng mới render
				if (additional) yPos = renderEnergyBar(context2D, additional, xPos, yPos);
				renderName(context2D, status.displayName, pos, yPos, color);
			}
		}
	})
	.build();

export default StatusBarRenderer;

/**
 * @param {CanvasRenderingContext2D} context2D
 * @param {PositionComponent} position - Dùng để tính vị trí render thanh máu
 * @param {SurvivalComponent} survival - Dùng để tính mức máu hiện tại để render
 * @param {{ width: number, height: number }} shape - Dùng để tính tọa độ Y thanh máu theo height tương đối của vật thể (collider size)
 * @param {string} color
 * @returns {[posX: number, posY: number]} Tọa độ X của thanh máu và tọa độ Y cách đáy thanh máu 5px
 */
function renderHealthBar(context2D, survival, position, shape, color) {
	const { x, y } = position;
	const { limitHP, currentHP } = survival;

	// Sizes
	const currentHpWidth = (currentHP / limitHP) * HP_BAR_WIDTH;

	// Vị trí thanh máu
	const barX = x - HP_BAR_WIDTH / 2;
	const barY = y + shape.height / 2 + 10; // Tính từ tâm tank nên lấy 1 nửa collider + 10px

	context2D.save();

	// Kiểm tra HP thấp
	if (currentHP / limitHP <= 0.2) {
		context2D.shadowColor = 'rgba(255, 0, 0, 0.85)'; // Màu đỏ mờ
		context2D.shadowBlur = 15; // Độ mờ của viền

		// Vẽ hiệu ứng viền đỏ quanh thanh máu
		context2D.beginPath();
		context2D.roundRect(barX - 3, barY - 3, HP_BAR_WIDTH + 6, HP_BAR_HEIGHT + 6, HP_BAR_BORDER_RADIUS + 3);
		context2D.strokeStyle = 'rgba(255, 0, 0, 0.75)'; // Màu đỏ
		context2D.lineWidth = 1;
		context2D.stroke();
		context2D.closePath();

		// Reset shadow để không ảnh hưởng phần sau
		context2D.shadowColor = 'transparent';
		context2D.shadowBlur = 0;
	}

	// Viền xám mờ
	context2D.beginPath();
	context2D.strokeStyle = '#666666'; // Màu viền
	context2D.lineWidth = 2; // Độ dày viền
	context2D.roundRect(
		barX - HP_BAR_BORDER_WIDTH,
		barY - HP_BAR_BORDER_WIDTH,
		HP_BAR_WIDTH + 2 * HP_BAR_BORDER_WIDTH,
		HP_BAR_HEIGHT + 2 * HP_BAR_BORDER_WIDTH,
		HP_BAR_BORDER_RADIUS
	);
	context2D.stroke();
	context2D.closePath();

	// Viền trong
	context2D.beginPath();
	context2D.strokeStyle = 'rgba(0, 0, 0, .5)'; // Màu viền
	context2D.lineWidth = HP_BAR_BORDER_WIDTH; // Độ dày viền
	context2D.roundRect(barX, barY, HP_BAR_WIDTH, HP_BAR_HEIGHT, HP_BAR_BORDER_RADIUS);
	context2D.stroke();
	context2D.closePath();

	// Viền ngoài
	context2D.beginPath();
	context2D.strokeStyle = 'rgba(0, 0, 0, .9)'; // Màu viền
	context2D.lineWidth = HP_BAR_BORDER_WIDTH; // Độ dày viền
	context2D.roundRect(
		barX - 2.5 * HP_BAR_BORDER_WIDTH,
		barY - 2.5 * HP_BAR_BORDER_WIDTH,
		HP_BAR_WIDTH + 5 * HP_BAR_BORDER_WIDTH,
		HP_BAR_HEIGHT + 5 * HP_BAR_BORDER_WIDTH,
		HP_BAR_BORDER_RADIUS
	);
	context2D.stroke();
	context2D.closePath();

	// Tạo gradient cho nền thanh máu
	const bgGradient = context2D.createLinearGradient(barX, barY, barX, barY + HP_BAR_HEIGHT);
	bgGradient.addColorStop(0, 'rgba(0, 0, 0, .45)'); // Màu chính
	bgGradient.addColorStop(0.5, 'rgba(0, 0, 0, .45)'); // Giữ màu chính cho 50% đầu tiên
	bgGradient.addColorStop(1, darkenColor('rgb(0, 0, 0)', 0.5)); // Màu đậm hơn ở phần dưới cùng

	// Vẽ nền thanh máu
	context2D.fillStyle = bgGradient;
	context2D.beginPath();
	context2D.roundRect(
		barX + HP_BAR_BORDER_WIDTH / 2,
		barY + HP_BAR_BORDER_WIDTH / 2,
		HP_BAR_WIDTH - HP_BAR_BORDER_WIDTH,
		HP_BAR_HEIGHT - HP_BAR_BORDER_WIDTH,
		0
	);
	context2D.fill();
	context2D.closePath();

	// Tạo gradient cho thanh máu
	const gradient = context2D.createLinearGradient(barX, barY, barX, barY + HP_BAR_HEIGHT);
	gradient.addColorStop(0, color); // Màu chính
	gradient.addColorStop(0.5, color); // Giữ màu chính cho 50% đầu tiên
	// @ts-expect-error: Color lấy từ constant nên đã chuẩn định dạng
	gradient.addColorStop(1, darkenColor(color, 0.5)); // Màu đậm hơn ở phần dưới cùng

	// Vẽ nền thanh máu hiện tại
	context2D.fillStyle = gradient;
	context2D.beginPath();
	context2D.roundRect(
		barX + HP_BAR_BORDER_WIDTH / 2,
		barY + HP_BAR_BORDER_WIDTH / 2,
		currentHpWidth - HP_BAR_BORDER_WIDTH,
		HP_BAR_HEIGHT - HP_BAR_BORDER_WIDTH,
		0
	);
	context2D.fill();
	context2D.closePath();

	// Vẽ các vạch phân chia 500HP
	if (limitHP < 7501) {
		context2D.strokeStyle = 'black';
		const segmentWidth = HP_BAR_WIDTH / (limitHP / 500);
		for (let i = 1; i < limitHP / 500; i++) {
			const segmentX = barX + i * segmentWidth;
			context2D.lineWidth = (1.5 * 50) / 67;
			context2D.beginPath();
			context2D.moveTo(segmentX, barY);
			context2D.lineTo(segmentX, barY + HP_BAR_HEIGHT - HP_BAR_HEIGHT * 0.4);
			context2D.stroke();
		}
	}

	context2D.restore();

	return [barX, HP_BAR_HEIGHT + barY + 5];
}

/**
 * Note: Width của energy bar kế thừa từ thanh HP, không cần định nghĩa constant mới
 *
 * @param {CanvasRenderingContext2D} context2D
 * @param {AdditionalAttributesComponent} additional - Dùng để tính mức năng lượng hiện tại để render
 * @param {number} xPos - Tọa độ X nhận được sau khi render thanh máu
 * @param {number} yPos - Tọa độ Y nhận được sau khi render thanh máu
 * @returns Tọa độ Y cách đáy thanh năng lượng 5px
 */
function renderEnergyBar(context2D, additional, xPos, yPos) {
	if (!additional || !additional.limitEnergyPoint) return yPos;

	const color = STATUS_BAR_COLORS['energy'];
	const { limitEnergyPoint: limE, currentEnergyPoint: curE } = additional;

	// Sizes
	const currentEnegyWidth = (curE / limE) * HP_BAR_WIDTH;

	context2D.save();

	// Viền xám mờ
	context2D.beginPath();
	context2D.strokeStyle = '#666666'; // Màu viền
	context2D.lineWidth = 2; // Độ dày viền
	context2D.roundRect(
		xPos - 1 * ENERGY_BAR_BORDER_WIDTH,
		yPos - 1 * ENERGY_BAR_BORDER_WIDTH,
		HP_BAR_WIDTH + 2 * ENERGY_BAR_BORDER_WIDTH,
		ENERGY_BAR_HEIGHT + 2 * ENERGY_BAR_BORDER_WIDTH,
		ENERGY_BAR_BORDER_RADIUS
	);
	context2D.stroke();
	context2D.closePath();

	// Viền trong
	context2D.beginPath();
	context2D.strokeStyle = 'rgba(0, 0, 0, .5)'; // Màu viền
	context2D.lineWidth = ENERGY_BAR_BORDER_WIDTH; // Độ dày viền
	context2D.roundRect(xPos, yPos, HP_BAR_WIDTH, ENERGY_BAR_HEIGHT, ENERGY_BAR_BORDER_RADIUS);
	context2D.stroke();
	context2D.closePath();

	// Viền ngoài
	context2D.beginPath();
	context2D.strokeStyle = 'rgba(0, 0, 0, .9)'; // Màu viền
	context2D.lineWidth = ENERGY_BAR_BORDER_WIDTH; // Độ dày viền
	context2D.roundRect(
		xPos - 2.5 * ENERGY_BAR_BORDER_WIDTH,
		yPos - 2.5 * ENERGY_BAR_BORDER_WIDTH,
		HP_BAR_WIDTH + 5 * ENERGY_BAR_BORDER_WIDTH,
		ENERGY_BAR_HEIGHT + 5 * ENERGY_BAR_BORDER_WIDTH,
		ENERGY_BAR_BORDER_RADIUS
	);
	context2D.stroke();
	context2D.closePath();

	// Tạo gradient cho nền
	const bgGradient = context2D.createLinearGradient(xPos, yPos, xPos, yPos + ENERGY_BAR_HEIGHT);
	bgGradient.addColorStop(0, 'rgba(0, 0, 0, .45)'); // Màu chính
	bgGradient.addColorStop(0.5, 'rgba(0, 0, 0, .45)'); // Giữ màu chính cho 50% đầu tiên
	bgGradient.addColorStop(1, darkenColor('rgb(0, 0, 0)', 0.5)); // Màu đậm hơn ở phần dưới cùng

	// Vẽ nền
	context2D.fillStyle = bgGradient;
	context2D.beginPath();
	context2D.roundRect(
		xPos + ENERGY_BAR_BORDER_WIDTH / 2,
		yPos + ENERGY_BAR_BORDER_WIDTH / 2,
		HP_BAR_WIDTH - ENERGY_BAR_BORDER_WIDTH,
		ENERGY_BAR_HEIGHT - ENERGY_BAR_BORDER_WIDTH,
		0
	);
	context2D.fill();
	context2D.closePath();

	// Tạo gradient
	const gradient = context2D.createLinearGradient(xPos, yPos, xPos, yPos + ENERGY_BAR_HEIGHT);
	gradient.addColorStop(0, color); // Màu chính
	gradient.addColorStop(0.5, color); // Giữ màu chính cho 50% đầu tiên
	// @ts-expect-error: color lấy từ constants nên chắc chắn chuẩn
	gradient.addColorStop(1, darkenColor(color, 0.5)); // Màu đậm hơn ở phần dưới cùng

	// Vẽ nền thanh năng lượng hiện tại
	context2D.fillStyle = gradient;
	context2D.beginPath();
	context2D.roundRect(
		xPos + ENERGY_BAR_BORDER_WIDTH / 2,
		yPos + ENERGY_BAR_BORDER_WIDTH / 2,
		currentEnegyWidth - ENERGY_BAR_BORDER_WIDTH,
		ENERGY_BAR_HEIGHT - ENERGY_BAR_BORDER_WIDTH,
		0
	);
	context2D.fill();
	context2D.closePath();

	context2D.restore();

	return yPos + ENERGY_BAR_HEIGHT + 5;
}

/**
 * @param {CanvasRenderingContext2D} context2D
 * @param {string} name
 * @param {PositionComponent} position
 * @param {number} yPos
 * @param {string} color
 */
function renderName(context2D, name, position, yPos, color) {
	const { x } = position;

	context2D.save();

	context2D.shadowColor = 'rgba(0, 0, 0, 0.75)';
	context2D.shadowBlur = 1;

	context2D.fillStyle = color;
	context2D.font = `700 ${STATUS_BAR_FONT_SIZE}px "Noto Sans", sans-serif`;
	context2D.textAlign = 'center';
	context2D.textBaseline = 'top';
	context2D.lineWidth = STATUS_BAR_FONT_SIZE / 25; // Điều chỉnh độ dày viền theo font size

	context2D.strokeText(name, x + STATUS_BAR_FONT_SIZE / 25, yPos);
	context2D.fillText(name, x, yPos); // Vẽ tên nhân vật
	context2D.restore();
}

/**
 * @private
 * @param {`rgb(${number}, ${number}, ${number})`} color
 * @param {number} amount
 */
function darkenColor(color, amount) {
	// @ts-ignore
	const [r, g, b] = color.match(/\d+/g).map(Number);
	return `rgb(${Math.max(r - amount * 255, 0)}, ${Math.max(g - amount * 255, 0)}, ${Math.max(b - amount * 255, 0)})`;
}
