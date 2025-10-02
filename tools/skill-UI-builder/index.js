/**
 * Vẽ skill bar và thanh HP ở đáy màn hình
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} skillData - Dữ liệu các skill
 * @param {Object} skillData.sp - Skill support (phím Q)
 * @param {HTMLImageElement|null} skillData.sp.image - Hình ảnh skill, null nếu không có
 * @param {Object} skillData.sp.cooldown - Thông tin cooldown
 * @param {number} skillData.sp.cooldown.current - Thời gian cooldown hiện tại (giây)
 * @param {number} skillData.sp.cooldown.max - Thời gian cooldown tối đa (giây)
 * @param {Object} skillData.s1 - Skill 1 (phím R) - cấu trúc giống sp
 * @param {HTMLImageElement|null} skillData.s1.image
 * @param {Object} skillData.s1.cooldown
 * @param {number} skillData.s1.cooldown.current
 * @param {number} skillData.s1.cooldown.max
 * @param {Object} skillData.s2 - Skill 2 (phím E) - cấu trúc giống sp
 * @param {HTMLImageElement|null} skillData.s2.image
 * @param {Object} skillData.s2.cooldown
 * @param {number} skillData.s2.cooldown.current
 * @param {number} skillData.s2.cooldown.max
 * @param {Object} skillData.ultimate - Skill ultimate (phím Space) - cấu trúc giống sp
 * @param {HTMLImageElement | null} skillData.ultimate.image
 * @param {Object} skillData.ultimate.cooldown
 * @param {number} skillData.ultimate.cooldown.current
 * @param {number} skillData.ultimate.cooldown.max
 * @param {Object} hpData - Dữ liệu HP
 * @param {number} hpData.current - HP hiện tại
 * @param {number} hpData.max - HP tối đa
 */
function drawSkillBar(ctx, canvas, skillData, hpData) {
	// Cấu hình kích thước
	const config = {
		skillSize: 60, // Kích thước mỗi ô skill
		skillGap: 10, // Khoảng cách giữa các ô
		skillY: canvas.height - 70, // Vị trí Y của skill bar (sát đáy hơn)

		hpBarWidth: 135, // Chiều rộng thanh máu
		hpBarHeight: 15, // Chiều cao thanh máu
		hpBarGap: 10, // Khoảng cách giữa thanh máu và skill

		cornerRadius: 5, // Bo góc
	};

	// Tính toán vị trí để căn giữa 4 ô skill
	const totalSkillWidth = config.skillSize * 4 + config.skillGap * 3;
	const skillStartX = (canvas.width - totalSkillWidth) / 2;

	// Vị trí thanh máu (bên trái 4 ô skill, sát đáy)
	const hpBarX = skillStartX - config.hpBarWidth - config.hpBarGap;
	const hpBarY = canvas.height - config.hpBarHeight - 10;

	// Vẽ thanh máu
	drawHPBar(ctx, hpBarX, hpBarY, config.hpBarWidth, config.hpBarHeight, hpData.current, hpData.max, 2);

	// Vẽ các skill
	const skills = /**@type {const}*/ (['s1', 's2', 'ultimate', 'sp']);
	const keyLabels = ['R', 'E', 'SPACE', 'Q'];

	skills.forEach((skillKey, index) => {
		const x = skillStartX + (config.skillSize + config.skillGap) * index;
		const skill = skillData[skillKey];

		drawSkillSlot(ctx, x, config.skillY, config.skillSize, skill, keyLabels[index], config.cornerRadius);
	});
}

/**
 * Vẽ thanh HP với gradient
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Tọa độ X
 * @param {number} y - Tọa độ Y
 * @param {number} width - Chiều rộng thanh HP
 * @param {number} height - Chiều cao thanh HP
 * @param {number} current - HP hiện tại
 * @param {number} max - HP tối đa
 * @param {number} radius - Bán kính bo góc
 */
function drawHPBar(ctx, x, y, width, height, current, max, radius) {
	// Tính toán % máu
	const hpPercent = Math.max(0, Math.min(1, current / max));
	const hpWidth = width * hpPercent;

	// Vẽ nền thanh máu (màu đỏ đậm)
	ctx.fillStyle = '#5c5c5cff';
	roundRect(ctx, x, y, width, height, radius, true, false);

	// Vẽ thanh máu với gradient giống hình
	if (hpWidth > 0) {
		const gradient = ctx.createLinearGradient(x, y, x + width, y);
		gradient.addColorStop(0, '#2cd5ffff'); // Xanh lá
		gradient.addColorStop(0.25, '#aaff00ff'); // Xanh lá
		gradient.addColorStop(0.5, '#FFFF00'); // Vàng
		gradient.addColorStop(0.75, '#ff7519ff'); // Đỏ
		gradient.addColorStop(1, '#FF0000'); // Đỏ

		ctx.save();
		ctx.beginPath();
		roundRect(ctx, x, y, hpWidth, height, radius, false, false);
		ctx.clip();
		ctx.fillStyle = gradient;
		ctx.fillRect(x, y, hpWidth, height);
		ctx.restore();
	}

	// Vẽ text HP
	ctx.fillStyle = '#003cbdff';
	ctx.font = '14px Arial';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	ctx.shadowBlur = 3;
	ctx.fillText(`${Math.floor(current)}/${Math.floor(max)}`, x + width / 2, y + height / 2 + 14 / 7);
	ctx.shadowBlur = 0;
}

/**
 * Vẽ một ô skill với cooldown radial
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Tọa độ X
 * @param {number} y - Tọa độ Y
 * @param {number} size - Kích thước ô skill (vuông)
 * @param {Object} skill - Dữ liệu skill
 * @param {HTMLImageElement|null} skill.image - Hình ảnh skill
 * @param {Object} skill.cooldown - Thông tin cooldown
 * @param {number} skill.cooldown.current - Thời gian cooldown hiện tại (giây)
 * @param {number} skill.cooldown.max - Thời gian cooldown tối đa (giây)
 * @param {string} keyLabel - Label phím (Q, R, E, SPACE)
 * @param {number} radius - Bán kính bo góc
 */
function drawSkillSlot(ctx, x, y, size, skill, keyLabel, radius) {
	const borderWidth = 3.25;

	// Vẽ nền ô skill
	ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
	roundRect(ctx, x, y, size, size, radius, true, false);

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
		// Vùng xám nếu không có hình
		ctx.fillStyle = '#717171ff';
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
		const cdPercent = 1 - skill.cooldown.current / skill.cooldown.max;

		ctx.save();
		ctx.beginPath();
		roundRect(ctx, x, y, size, size, radius, false, false);
		ctx.clip();

		// Vẽ overlay tối
		ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
		ctx.fillRect(x, y, size, size);

		// Vẽ phần sáng (radial cooldown)
		const centerX = x + size / 2;
		const centerY = y + size / 2;
		const startAngle = -Math.PI / 2; // Bắt đầu từ trên cùng
		const endAngle = startAngle + Math.PI * 2 * cdPercent;

		ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.arc(centerX, centerY, size, startAngle, endAngle);
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
	ctx.strokeStyle = isReady ? '#ffffffff' : '#4b4b4bff';
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
