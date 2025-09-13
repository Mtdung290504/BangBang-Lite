/**@type {HTMLCanvasElement} */
const canvas = document.getElementById('aimCanvas');
const ctx = canvas.getContext('2d');
const { width, height } = canvas.getBoundingClientRect();
if (!ctx) throw new Error();

canvas.width = width * 2;
canvas.height = height * 2;

const cx = canvas.width / 2;
const cy = canvas.height / 2;

renderAim(ctx, 300, { x: cx, y: cy });

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} radius
 * @param {{ x: number, y: number }} pos
 */
function renderAim(ctx, radius, pos) {
	const ratio = radius / 290;
	const space = 8 * ratio;
	const { x: posX, y: posY } = pos;

	const color = (alpha = 0.7) => `rgba(0, 230, 255, ${alpha})`;

	const largeLW = 3 * ratio;
	const thinLW = largeLW / 2;

	// Vòng tròn ngoài
	ctx.beginPath();
	ctx.arc(posX, posY, radius, 0, Math.PI * 2);
	ctx.lineWidth = largeLW;
	ctx.strokeStyle = color();
	ctx.stroke();

	// Vòng tròn trong
	ctx.beginPath();
	ctx.arc(posX, posY, radius - space, 0, Math.PI * 2);
	ctx.lineWidth = thinLW;
	ctx.strokeStyle = color();
	ctx.stroke();

	// Vòng tròn mờ
	ctx.save();
	ctx.beginPath();
	ctx.arc(posX, posY, radius - space * 1.75 - radius / 20, 0, Math.PI * 2);
	ctx.lineWidth = radius / 10; // largeLW * 8;
	ctx.strokeStyle = color(0.2);
	ctx.stroke();
	ctx.restore();

	// Hình thoi ở tâm
	const halfSize = 10 * ratio;
	ctx.beginPath();
	ctx.moveTo(posX, posY - halfSize); // trên
	ctx.lineTo(posX + halfSize, posY); // phải
	ctx.lineTo(posX, posY + halfSize); // dưới
	ctx.lineTo(posX - halfSize, posY); // trái
	ctx.closePath();
	ctx.fillStyle = color();
	ctx.fill(); // tô kín hình

	// Vẽ 4 đường định tâm theo 4 hướng
	drawDirectionLine(ctx, posX, posY, space, halfSize, thinLW, radius, color, 0); // Hướng lên
	drawDirectionLine(ctx, posX, posY, space, halfSize, thinLW, radius, color, 90); // Hướng phải
	drawDirectionLine(ctx, posX, posY, space, halfSize, thinLW, radius, color, 180); // Hướng xuống
	drawDirectionLine(ctx, posX, posY, space, halfSize, thinLW, radius, color, 270); // Hướng trái

	drawCornerArrows(ctx, posX, posY, radius, thinLW, color);
	drawCurvedArcs(ctx, posX, posY, radius, space, color);
}

/**
 * Vẽ một đường định tâm theo góc xoay
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} posX
 * @param {number} posY
 * @param {number} space
 * @param {number} halfSize
 * @param {number} thinLW
 * @param {number} radius
 * @param {Function} color
 * @param {number} angle - Góc xoay (độ)
 */
function drawDirectionLine(ctx, posX, posY, space, halfSize, thinLW, radius, color, angle) {
	ctx.save();
	halfSize *= 1.5;

	// Xoay canvas theo góc
	ctx.translate(posX, posY);
	ctx.rotate((angle * Math.PI) / 180);
	ctx.translate(-posX, -posY);

	// Vẽ đường chính
	ctx.beginPath();
	const modify = 0.65;
	ctx.moveTo(posX + 1.75 * halfSize * modify, posY - space / modify);
	ctx.lineTo(posX + halfSize * modify, posY - space / modify);
	ctx.lineWidth = thinLW * 0.75;
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(posX + halfSize * modify, posY - space / modify);
	ctx.lineTo(posX, posY - halfSize - space);
	ctx.lineWidth = thinLW * 2;
	ctx.stroke();
	ctx.moveTo(posX, posY - halfSize - space);
	ctx.lineTo(posX, posY - radius / 2.5);
	ctx.lineWidth = thinLW;
	ctx.strokeStyle = color();
	ctx.stroke();

	// Vẽ phần tam giác tô màu
	ctx.beginPath();
	ctx.lineWidth = thinLW / 2;
	ctx.moveTo(posX - thinLW / 2, posY - radius / 4 / 1.2);
	ctx.lineTo(posX - space * 1.1, posY - radius / 3 / 1.3);
	ctx.lineTo(posX - space / 2, posY - radius / 1.3);
	ctx.lineTo(posX - space / 4, posY - radius / 2.3);
	ctx.lineTo(posX, posY - radius / 2.5);
	ctx.closePath();
	ctx.strokeStyle = color();
	ctx.stroke();
	ctx.fillStyle = color(0.5);
	ctx.fill();

	ctx.restore();
}

/**
 * Vẽ 4 đường cong sáng với phần nhọn và hiệu ứng gradient
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} posX
 * @param {number} posY
 * @param {number} radius
 * @param {number} space
 * @param {Function} color
 */
function drawCurvedArcs(ctx, posX, posY, radius, space, color) {
	const arcLength = Math.PI / 3; // Độ dài của mỗi cung
	const arcRadius = radius - space * 1.5 - radius / 10;
	const arcLW = radius / 22;

	// Vẽ 4 đường cong sáng
	for (let i = 0; i < 4; i++) {
		const angle = (i * Math.PI) / 2 + Math.PI / 6.5; // Góc bắt đầu cho mỗi cung
		const endAngle = angle + arcLength;

		ctx.save();

		// Tạo gradient từ điểm kết thúc về điểm bắt đầu của cung (để đảo chiều)
		const startX = posX + Math.cos(angle) * arcRadius;
		const startY = posY + Math.sin(angle) * arcRadius;
		const endX = posX + Math.cos(endAngle) * arcRadius;
		const endY = posY + Math.sin(endAngle) * arcRadius;

		const gradient = ctx.createLinearGradient(endX, endY, startX, startY);
		gradient.addColorStop(0, color(1)); // Sáng ở đầu (điểm bắt đầu thực tế)
		gradient.addColorStop(0.15, color(0.9)); // Sáng ở đầu (điểm bắt đầu thực tế)
		gradient.addColorStop(0.5, color(0.5)); // Sáng ở giữa
		gradient.addColorStop(1, color(0)); // Mờ ở cuối

		// Vẽ đường cong chính với gradient
		ctx.beginPath();
		ctx.arc(posX, posY, arcRadius, angle, endAngle);
		ctx.lineWidth = arcLW;
		ctx.strokeStyle = gradient;
		ctx.stroke();

		// Vẽ phần nhọn ở đầu cung (xoay 90 độ và điều chỉnh vị trí)
		const arrowAngle = endAngle + Math.PI / 2; // Xoay 90 độ
		const arrowSize = space * 2;

		// Tính đường cao và cạnh đáy của tam giác
		const height = arrowSize * Math.cos(Math.PI / 4); // Đường cao tam giác
		const baseHalf = arrowSize * Math.sin(Math.PI / 4); // Nửa cạnh đáy

		// Điều chỉnh vị trí đỉnh mũi nhọn: dịch trái một đường cao, xuống dưới nửa cạnh đáy
		const arrowTipX = endX - (Math.cos(endAngle) * height) / 2 - Math.cos(endAngle + Math.PI / 2) * baseHalf;
		const arrowTipY = endY - (Math.sin(endAngle) * height) / 2 - Math.sin(endAngle + Math.PI / 2) * baseHalf;

		ctx.beginPath();
		ctx.moveTo(arrowTipX, arrowTipY);
		ctx.lineTo(
			arrowTipX + Math.cos(arrowAngle + Math.PI / 4) * arrowSize,
			arrowTipY + Math.sin(arrowAngle + Math.PI / 4) * arrowSize
		);
		ctx.lineTo(
			arrowTipX + Math.cos(arrowAngle - Math.PI / 4) * arrowSize,
			arrowTipY + Math.sin(arrowAngle - Math.PI / 4) * arrowSize
		);
		ctx.closePath();
		ctx.fillStyle = color(1);
		ctx.lineWidth = 0.1;
		ctx.stroke();
		ctx.fill();

		ctx.restore();
	}
}

/**
 * Vẽ các mũi nhọn hướng vào trong theo góc chéo
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} posX
 * @param {number} posY
 * @param {number} radius
 * @param {number} thinLW
 * @param {Function} color
 */
function drawCornerArrows(ctx, posX, posY, radius, thinLW, color) {
	const arrowDistance = radius * 0.77; // Khoảng cách từ tâm đến mũi tên
	const arrowLength = radius * 0.24; // Chiều dài của hình thoi
	const arrowWidth = 3; // Chiều rộng của hình thoi

	// Vẽ 4 mũi nhọn ở các góc chéo
	for (let i = 0; i < 4; i++) {
		const angle = (i * Math.PI) / 2 + Math.PI / 4; // 45°, 135°, 225°, 315°

		ctx.save();

		// Tính vị trí mũi tên
		const arrowX = posX + Math.cos(angle) * arrowDistance;
		const arrowY = posY + Math.sin(angle) * arrowDistance;

		// Xoay để mũi tên hướng ra góc (không hướng về tâm)
		ctx.translate(arrowX, arrowY);
		ctx.rotate(angle + (90 * Math.PI) / 180); // Hướng ra góc thay vì về tâm

		// Vẽ hình thoi dài với đầu nhọn hướng về tâm
		ctx.beginPath();
		ctx.moveTo(0, 0); // Đỉnh nhọn hướng về tâm
		ctx.lineTo(-arrowWidth / 2, arrowLength * 0.05); // Điểm giữa trái
		ctx.lineTo(0, arrowLength); // Đỉnh tù ở ngoài
		ctx.lineTo(arrowWidth / 2, arrowLength * 0.05); // Điểm giữa phải
		ctx.closePath();

		// Vẽ viền
		ctx.lineWidth = thinLW / 2;
		ctx.strokeStyle = color(0.4);
		ctx.stroke();

		ctx.fillStyle = color(0.4);
		ctx.fill();

		ctx.restore();
	}
}
