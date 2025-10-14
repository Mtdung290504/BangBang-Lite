// Type only
import EntityManager from '../../../../managers/combat/mgr.Entity.js';

// Base & parser
import BaseActionExecutor from '../base/executor.BaseAction.js';
import parseDoTeleportManifest from './parsers/parseDoTeleportManifest.js';

import SkillContextComponent from '../../../../components/combat/state/skill/com.SkillContext.js';
import PositionComponent from '../../../../components/physics/com.Position.js';

import { RANGE_CALCULATION_CONSTANT } from '../../../../../../configs/constants/domain_constants/com.constants.js';
import TeleportActionComponent from '../../../../components/combat/action/com.Teleport.js';
import { degToRad } from '../../../../fomulars/angle.js';

export default class DoTeleportExecutor extends BaseActionExecutor {
	/**
	 * @param {EntityManager} context
	 * @param {import('./parsers/parseDoTeleportManifest.js').TeleportAction} manifest
	 */
	constructor(context, manifest) {
		if (manifest.action !== '@do:teleport') throw new TypeError('Invalid action manifest');

		super(context);
		this.parsedManifest = parseDoTeleportManifest(manifest);
	}

	/**
	 * @override
	 * @param {number} selfTankEID
	 */
	exec(selfTankEID) {
		const { context, parsedManifest } = this;
		const range = parsedManifest.range * RANGE_CALCULATION_CONSTANT;

		const { mousePosRef, headAngleRef } = context.getComponent(selfTankEID, SkillContextComponent);
		const { x: mouseX, y: mouseY } = mousePosRef;
		const angleDeg = headAngleRef.angle;
		const pos = context.getComponent(selfTankEID, PositionComponent);

		// TODO: Tạo và tính toX, toY nếu tọa độ chuột cách position ngắn hơn range thì dịch chuyển đến tọa độ chuột
		// Nếu không, dịch chuyển đến khoảng cách tối đa bằng với range theo hướng chuột

		// Note: phiên bản cũ, gắn trực tiếp vào position
		// Tính vector từ tank đến chuột
		// const dx = mouseX - pos.x;
		// const dy = mouseY - pos.y;
		// const distanceToMouse = Math.hypot(dx, dy);

		// let toX, toY;

		// if (distanceToMouse <= range) {
		// 	// Nếu chuột nằm trong phạm vi range, teleport đến vị trí chuột
		// 	toX = mouseX;
		// 	toY = mouseY;
		// } else {
		// 	// Nếu chuột ngoài phạm vi, teleport đến khoảng cách tối đa theo hướng chuột
		// 	// Normalize vector và nhân với range
		// 	const ratio = range / distanceToMouse;
		// 	toX = pos.x + dx * ratio;
		// 	toY = pos.y + dy * ratio;
		// }

		// Note: Phiên bản mới, trả về velocity để lưu history (Có phần kém ổn định hơn)
		const dx = mouseX - pos.x;
		const dy = mouseY - pos.y;
		const distanceToMouse = Math.hypot(dx, dy);

		let deltaX, deltaY;

		if (distanceToMouse <= range) {
			// Nếu chuột nằm trong phạm vi range, teleport đến vị trí chuột
			deltaX = dx;
			deltaY = dy;
		} else {
			// Nếu chuột ngoài phạm vi, teleport đến khoảng cách tối đa theo hướng chuột
			// Normalize vector và nhân với range
			const ratio = range / distanceToMouse;
			deltaX = dx * ratio;
			deltaY = dy * ratio;
		}

		// Thêm component vào tank sau khi tính toán
		context.addComponent(selfTankEID, new TeleportActionComponent(deltaX, deltaY));
	}
}
