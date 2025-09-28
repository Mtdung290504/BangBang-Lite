import ColliderComponent from '../components/physics/com.Collider.js';
import PositionComponent from '../components/physics/com.Position.js';

/**
 * @param {PositionComponent} circlePos
 * @param {ColliderComponent<'circle'>} circle
 * @param {PositionComponent} rectPos
 * @param {ColliderComponent<'rectangle'>} rect
 * @param {number} [rectAngle=0]
 */
export function circleCollisionRectangle(circlePos, circle, rectPos, rect, rectAngle = 0) {
	const dx = circlePos.x - rectPos.x;
	const dy = circlePos.y - rectPos.y;

	// Check for unacceptable distances
	const maxDist = Math.max(rect.width, rect.height) / 2 + circle.radius;
	if (dx * dx + dy * dy > maxDist * maxDist) return false;

	// Convert the circle to the coordinate system of a rectangle (remove rotation)
	const cosAngle = Math.cos(rectAngle);
	const sinAngle = Math.sin(rectAngle);

	// Circular coordinates in the new reference system
	const localCircleX = cosAngle * dx + sinAngle * dy;
	const localCircleY = -sinAngle * dx + cosAngle * dy;

	// Get the size of the rectangle
	const { width: rw, height: rh } = rect;
	const { radius: cr } = circle;

	// Find the closest point on the rectangle to the center of the circle
	const closestX = Math.max(-rw / 2, Math.min(localCircleX, rw / 2));
	const closestY = Math.max(-rh / 2, Math.min(localCircleY, rh / 2));

	// Calculate the distance from the center of the circle to the nearest point
	const distX = localCircleX - closestX;
	const distY = localCircleY - closestY;

	return distX * distX + distY * distY < cr * cr;
}

// import { Point, Circle, Line, RotableRectangle, Polygon } from '../bases/bases.mjs';

// export default class CollisionsChecker {
// 	/**
// 	 * Kiểm tra va chạm giữa hai hình tròn
// 	 * @param {Circle} circle1 - Hình tròn thứ nhất
// 	 * @param {Circle} circle2 - Hình tròn thứ hai
// 	 * @returns {boolean} - true nếu có va chạm, false nếu không
// 	 */
// 	circleCollisionCircle(circle1, circle2) {
// 		return circle1.distanceTo(circle2) < circle1.radius + circle2.radius;
// 	}

// 	/**
// 	 * Kiểm tra va chạm giữa hình chữ nhật xoay và hình tròn
// 	 * @param {RotableRectangle} rect - Hình chữ nhật xoay
// 	 * @param {Circle} circle - Hình tròn
// 	 * @returns {boolean} - true nếu có va chạm, false nếu không
// 	 */
// 	rotableRectangleCollisionCircle(rect, circle) {
// 		// Tính toán cos và sin của góc quay âm để chuyển đổi hệ tọa độ
// 		const cosAngle = Math.cos(-rect.angle);
// 		const sinAngle = Math.sin(-rect.angle);

// 		// Chuyển đổi tọa độ của hình tròn sang hệ tọa độ của hình chữ nhật sau khi xoay
// 		const relativeCircleX = cosAngle * (circle.x - rect.x) - sinAngle * (circle.y - rect.y) + rect.x;
// 		const relativeCircleY = sinAngle * (circle.x - rect.x) + cosAngle * (circle.y - rect.y) + rect.y;

// 		// Tính toán tọa độ gần nhất của hình tròn trên hình chữ nhật không xoay
// 		const halfWidth = rect.width / 2;
// 		const halfHeight = rect.height / 2;
// 		const closestX = Math.max(rect.x - halfWidth, Math.min(relativeCircleX, rect.x + halfWidth));
// 		const closestY = Math.max(rect.y - halfHeight, Math.min(relativeCircleY, rect.y + halfHeight));

// 		// Tính toán khoảng cách từ tâm hình tròn đến điểm gần nhất của hình chữ nhật
// 		const distanceX = relativeCircleX - closestX;
// 		const distanceY = relativeCircleY - closestY;

// 		// Kiểm tra xem khoảng cách này có nhỏ hơn hoặc bằng bán kính hình tròn không
// 		return distanceX * distanceX + distanceY * distanceY <= circle.radius * circle.radius;
// 	}

// 	/**
// 	 * Kiểm tra va chạm giữa hình tròn và đa giác
// 	 * @param {Circle} circle - Hình tròn
// 	 * @param {Polygon} polygon - Đa giác
// 	 * @returns {boolean} - true nếu có va chạm, false nếu không
// 	 */
// 	circleCollisionPolygon(circle, polygon) {
// 		// Kiểm tra va chạm giữa hình tròn và các cạnh của đa giác
// 		for (let i = 0; i < polygon.points.length; i++) {
// 			const p1 = polygon.points[i];
// 			const p2 = polygon.points[(i + 1) % polygon.points.length];

// 			if (circleCollisionLineSegment(circle, p1, p2)) {
// 				return true;
// 			}
// 		}

// 		// Kiểm tra nếu tâm hình tròn nằm trong đa giác
// 		return this.#pointInPolygon(circle, polygon);

// 		/**
// 		 * Kiểm tra va chạm giữa hình tròn và đoạn thẳng
// 		 * @param {Circle} circle - Hình tròn (đạn)
// 		 * @param {Point} p1 - Điểm đầu của đoạn thẳng
// 		 * @param {Point} p2 - Điểm cuối của đoạn thẳng
// 		 * @returns {boolean} - true nếu có va chạm, false nếu không
// 		 */
// 		function circleCollisionLineSegment(circle, p1, p2) {
// 			// Tính toán điểm gần nhất trên đoạn thẳng đến tâm hình tròn
// 			const segmentLength = p1.distanceTo(p2);
// 			if (segmentLength === 0) return circle.distanceTo(p1) <= circle.radius;

// 			const t = Math.max(
// 				0,
// 				Math.min(
// 					1,
// 					((circle.x - p1.x) * (p2.x - p1.x) + (circle.y - p1.y) * (p2.y - p1.y)) /
// 						(segmentLength * segmentLength)
// 				)
// 			);

// 			const closestX = p1.x + t * (p2.x - p1.x);
// 			const closestY = p1.y + t * (p2.y - p1.y);

// 			const distanceX = circle.x - closestX;
// 			const distanceY = circle.y - closestY;

// 			return distanceX * distanceX + distanceY * distanceY <= circle.radius * circle.radius;
// 		}
// 	}

// 	/**
// 	 * Kiểm tra va chạm giữa hình tròn và đoạn thẳng
// 	 * @param {Circle} circle - Hình tròn
// 	 * @param {Line} line - Đoạn thẳng
// 	 * @returns {boolean} - true nếu có va chạm, false nếu không
// 	 */
// 	circleCollisionLine(circle, line) {
// 		const { start: p1, end: p2 } = line;
// 		// Tính toán độ dài đoạn thẳng
// 		const lineLength = p1.distanceTo(p2);

// 		// Nếu đoạn thẳng có độ dài bằng 0 (các điểm trùng nhau)
// 		if (lineLength === 0) return circle.distanceTo(p1) <= circle.radius;

// 		// Tính toán vector đoạn thẳng và vector từ điểm đầu đến tâm hình tròn
// 		const lineVectorX = p2.x - p1.x;
// 		const lineVectorY = p2.y - p1.y;
// 		const pointToCircleX = circle.x - p1.x;
// 		const pointToCircleY = circle.y - p1.y;

// 		// Tính toán hệ số t của điểm gần nhất trên đoạn thẳng
// 		const t = Math.max(
// 			0,
// 			Math.min(1, (pointToCircleX * lineVectorX + pointToCircleY * lineVectorY) / (lineLength * lineLength))
// 		);

// 		// Tính toán tọa độ của điểm gần nhất trên đoạn thẳng
// 		const closestX = p1.x + t * lineVectorX;
// 		const closestY = p1.y + t * lineVectorY;

// 		// Tính khoảng cách từ điểm gần nhất đến tâm hình tròn
// 		const distanceX = circle.x - closestX;
// 		const distanceY = circle.y - closestY;

// 		return distanceX * distanceX + distanceY * distanceY <= circle.radius * circle.radius;
// 	}

// 	/**
// 	 * Kiểm tra va chạm giữa hình chữ nhật xoay và đa giác
// 	 * @param {RotableRectangle} rotableRectangle - Hình chữ nhật xoay
// 	 * @param {Polygon} polygon - Đa giác
// 	 * @returns {boolean} - true nếu có va chạm, false nếu không
// 	 */
// 	rotableRectangleCollisionPolygon(rotableRectangle, polygon) {
// 		// Tạo hình chữ nhật không xoay từ hình chữ nhật xoay
// 		const cosAngle = Math.cos(-rotableRectangle.angle);
// 		const sinAngle = Math.sin(-rotableRectangle.angle);

// 		const halfWidth = rotableRectangle.width / 2;
// 		const halfHeight = rotableRectangle.height / 2;

// 		const rotatedCorners = [
// 			{
// 				x: rotableRectangle.x + halfWidth * cosAngle - halfHeight * sinAngle,
// 				y: rotableRectangle.y + halfWidth * sinAngle + halfHeight * cosAngle,
// 			},
// 			{
// 				x: rotableRectangle.x - halfWidth * cosAngle - halfHeight * sinAngle,
// 				y: rotableRectangle.y - halfWidth * sinAngle + halfHeight * cosAngle,
// 			},
// 			{
// 				x: rotableRectangle.x - halfWidth * cosAngle + halfHeight * sinAngle,
// 				y: rotableRectangle.y - halfWidth * sinAngle - halfHeight * cosAngle,
// 			},
// 			{
// 				x: rotableRectangle.x + halfWidth * cosAngle + halfHeight * sinAngle,
// 				y: rotableRectangle.y + halfWidth * sinAngle - halfHeight * cosAngle,
// 			},
// 		];

// 		// Chuyển đổi các điểm của đa giác về hệ tọa độ không xoay
// 		const transformedPolygonPoints = polygon.points.map((p) => {
// 			return {
// 				x: cosAngle * (p.x - rotableRectangle.x) - sinAngle * (p.y - rotableRectangle.y) + rotableRectangle.x,
// 				y: sinAngle * (p.x - rotableRectangle.x) + cosAngle * (p.y - rotableRectangle.y) + rotableRectangle.y,
// 			};
// 		});

// 		const transformedPolygon = new Polygon(transformedPolygonPoints);

// 		/**
// 		 * Kiểm tra va chạm giữa hình chữ nhật không xoay và đa giác
// 		 * @param {Point[]} rectCorners - Các đỉnh của hình chữ nhật không xoay
// 		 * @param {Polygon} polygon - Đa giác
// 		 * @returns {boolean} - true nếu có va chạm, false nếu không
// 		 */
// 		const rectCollisionPolygon = (rectCorners, polygon) => {
// 			// Hàm kiểm tra va chạm giữa hình chữ nhật không xoay và đa giác
// 			// Ví dụ đơn giản kiểm tra va chạm bằng cách so sánh từng cạnh
// 			for (let i = 0; i < polygon.points.length; i++) {
// 				const p1 = polygon.points[i];
// 				const p2 = polygon.points[(i + 1) % polygon.points.length];

// 				for (let j = 0; j < rectCorners.length; j++) {
// 					const r1 = rectCorners[j];
// 					const r2 = rectCorners[(j + 1) % rectCorners.length];

// 					if (this.#lineIntersectsSegment(p1, p2, r1, r2)) {
// 						return true;
// 					}
// 				}
// 			}

// 			// Kiểm tra nếu các đỉnh của hình chữ nhật nằm trong đa giác
// 			for (const corner of rectCorners) {
// 				if (this.#pointInPolygon(new Point(corner.x, corner.y), polygon)) {
// 					return true;
// 				}
// 			}

// 			// Kiểm tra nếu các đỉnh của đa giác nằm trong hình chữ nhật
// 			for (const point of polygon.points) {
// 				if (this.#pointInPolygon(point, new Polygon(rectCorners.map((c) => new Point(c.x, c.y))))) {
// 					return true;
// 				}
// 			}

// 			return false;
// 		};

// 		// Kiểm tra va chạm giữa hình chữ nhật không xoay và đa giác
// 		return rectCollisionPolygon(rotatedCorners, transformedPolygon);
// 	}

// 	/**
// 	 * Kiểm tra va chạm giữa hình chữ nhật xoay và đoạn thẳng
// 	 * @param {RotableRectangle} rotableRectangle - Hình chữ nhật xoay
// 	 * @param {Line} line - Đoạn thẳng
// 	 * @returns {boolean} - true nếu có va chạm, false nếu không
// 	 */
// 	rotableRectangleCollisionLine(rotableRectangle, line) {
// 		const { start: p1, end: p2 } = line;

// 		// Tính toán các đỉnh của hình chữ nhật không xoay
// 		const cosAngle = Math.cos(-rotableRectangle.angle);
// 		const sinAngle = Math.sin(-rotableRectangle.angle);

// 		const halfWidth = rotableRectangle.width / 2;
// 		const halfHeight = rotableRectangle.height / 2;

// 		const rectCorners = [
// 			{
// 				x: rotableRectangle.x + halfWidth * cosAngle - halfHeight * sinAngle,
// 				y: rotableRectangle.y + halfWidth * sinAngle + halfHeight * cosAngle,
// 			},
// 			{
// 				x: rotableRectangle.x - halfWidth * cosAngle - halfHeight * sinAngle,
// 				y: rotableRectangle.y - halfWidth * sinAngle + halfHeight * cosAngle,
// 			},
// 			{
// 				x: rotableRectangle.x - halfWidth * cosAngle + halfHeight * sinAngle,
// 				y: rotableRectangle.y - halfWidth * sinAngle - halfHeight * cosAngle,
// 			},
// 			{
// 				x: rotableRectangle.x + halfWidth * cosAngle + halfHeight * sinAngle,
// 				y: rotableRectangle.y + halfWidth * sinAngle - halfHeight * cosAngle,
// 			},
// 		];

// 		// Kiểm tra va chạm giữa đoạn thẳng và các cạnh của hình chữ nhật không xoay
// 		for (let i = 0; i < rectCorners.length; i++) {
// 			const r1 = rectCorners[i];
// 			const r2 = rectCorners[(i + 1) % rectCorners.length];

// 			if (this.#lineIntersectsSegment(p1, p2, r1, r2)) {
// 				return true;
// 			}
// 		}

// 		// Kiểm tra nếu đoạn thẳng đi qua các đỉnh của hình chữ nhật
// 		for (const corner of rectCorners) {
// 			if (pointOnLineSegment(new Point(corner.x, corner.y), p1, p2)) {
// 				return true;
// 			}
// 		}

// 		return false;

// 		/**
// 		 * Kiểm tra nếu điểm nằm trên đoạn thẳng
// 		 * @param {Point} point - Điểm cần kiểm tra
// 		 * @param {Point} p1 - Điểm đầu của đoạn thẳng
// 		 * @param {Point} p2 - Điểm cuối của đoạn thẳng
// 		 * @returns {boolean} - true nếu điểm nằm trên đoạn thẳng, false nếu không
// 		 */
// 		function pointOnLineSegment(point, p1, p2) {
// 			const minX = Math.min(p1.x, p2.x);
// 			const maxX = Math.max(p1.x, p2.x);
// 			const minY = Math.min(p1.y, p2.y);
// 			const maxY = Math.max(p1.y, p2.y);

// 			return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
// 		}
// 	}

// 	// Hàm phụ trợ
// 	/**
// 	 * Kiểm tra nếu điểm nằm trong đa giác
// 	 * @param {Point} point - Điểm cần kiểm tra
// 	 * @param {Polygon} polygon - Đa giác
// 	 * @returns {boolean} - true nếu điểm nằm trong đa giác, false nếu không
// 	 */
// 	#pointInPolygon(point, polygon) {
// 		let inside = false;
// 		const { x, y } = point;

// 		for (let i = 0, j = polygon.points.length - 1; i < polygon.points.length; j = i++) {
// 			const xi = polygon.points[i].x,
// 				yi = polygon.points[i].y;
// 			const xj = polygon.points[j].x,
// 				yj = polygon.points[j].y;

// 			const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

// 			if (intersect) inside = !inside;
// 		}
// 		return inside;
// 	}

// 	// Hàm phụ trợ
// 	/**
// 	 * Kiểm tra va chạm giữa hai đoạn thẳng
// 	 * @param {Point} p1 - Điểm đầu của đoạn thẳng thứ nhất
// 	 * @param {Point} p2 - Điểm cuối của đoạn thẳng thứ nhất
// 	 * @param {Point} q1 - Điểm đầu của đoạn thẳng thứ hai
// 	 * @param {Point} q2 - Điểm cuối của đoạn thẳng thứ hai
// 	 * @returns {boolean} - true nếu hai đoạn thẳng cắt nhau, false nếu không
// 	 */
// 	#lineIntersectsSegment(p1, p2, q1, q2) {
// 		const a1 = p2.y - p1.y;
// 		const b1 = p1.x - p2.x;
// 		const c1 = a1 * p1.x + b1 * p1.y;

// 		const a2 = q2.y - q1.y;
// 		const b2 = q1.x - q2.x;
// 		const c2 = a2 * q1.x + b2 * q1.y;

// 		const determinant = a1 * b2 - a2 * b1;

// 		if (determinant === 0) {
// 			return false; // Các đoạn thẳng song song
// 		}

// 		const x = (b2 * c1 - b1 * c2) / determinant;
// 		const y = (a1 * c2 - a2 * c1) / determinant;

// 		if (
// 			Math.min(p1.x, p2.x) <= x &&
// 			x <= Math.max(p1.x, p2.x) &&
// 			Math.min(p1.y, p2.y) <= y &&
// 			y <= Math.max(p1.y, p2.y) &&
// 			Math.min(q1.x, q2.x) <= x &&
// 			x <= Math.max(q1.x, q2.x) &&
// 			Math.min(q1.y, q2.y) <= y &&
// 			y <= Math.max(q1.y, q2.y)
// 		) {
// 			return true;
// 		}

// 		return false;
// 	}
// }
