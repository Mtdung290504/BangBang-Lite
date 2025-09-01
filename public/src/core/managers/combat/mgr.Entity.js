/**
 * Quản lý toàn bộ entity và component.
 */
export default class EntityManager {
	/**
	 * Danh sách toàn bộ entity ID đang tồn tại.
	 *
	 * @type {Set<number>}
	 * @private
	 */
	_entities = new Set();

	/**
	 * Lưu component theo kiểu: `Map<ComponentClass, Map<entityId, componentInstance>>`
	 *
	 * @type {Map<Function, Map<number, any>>}
	 * @private
	 */
	_components = new Map();

	/**
	 * ID sẽ gán cho entity mới tiếp theo.
	 *
	 * @type {number}
	 * @private
	 */
	_nextEntityId = 0;

	/**
	 * Tạo một entity mới và trả về ID của nó.
	 * @returns {number} ID entity mới
	 */
	createEntity() {
		const id = this._nextEntityId++;
		this._entities.add(id);
		return id;
	}

	/**
	 * Xóa entity và toàn bộ component của nó.
	 * @param {number} entity ID entity cần xóa
	 */
	removeEntity(entity) {
		if (!this._entities.delete(entity)) return; // Nếu entity không tồn tại thì bỏ qua

		// Xóa entity khỏi toàn bộ component map
		for (const compMap of this._components.values()) {
			compMap.delete(entity);
		}
	}

	/**
	 * Gắn một component instance vào entity.
	 *
	 * @param {number} entity ID entity
	 * @param {object} component Instance của component
	 */
	addComponent(entity, component) {
		const compClass = component.constructor;
		let compMap = this._components.get(compClass);

		if (!compMap) {
			compMap = new Map();
			this._components.set(compClass, compMap);
		}

		compMap.set(entity, component);
	}

	/**
	 * Gắn nhiều component vào entity cùng lúc.
	 *
	 * @param {number} entity ID entity
	 * @param {object[]} components Danh sách component instances
	 */
	addComponents(entity, components) {
		for (const component of components) {
			this.addComponent(entity, component);
		}
	}

	/**
	 * Xóa một component khỏi entity.
	 *
	 * @template T
	 *
	 * @param {number} entity ID entity
	 * @param {new (...args: any[]) => T} componentType Class của component
	 */
	removeComponent(entity, componentType) {
		this._components.get(componentType)?.delete(entity);
	}

	/**
	 * Xóa nhiều component khỏi entity cùng lúc.
	 *
	 * @param {number} entity ID entity
	 * @param {...(new (...args: any[]) => any)} componentTypes Danh sách class component
	 */
	removeComponents(entity, ...componentTypes) {
		for (const componentType of componentTypes) {
			this.removeComponent(entity, componentType);
		}
	}

	/**
	 * Kiểm tra entity có component chỉ định không.
	 *
	 * @template T
	 *
	 * @param {number} entity ID entity
	 * @param {new (...args: any[]) => T} componentType Class của component
	 *
	 * @returns {boolean} true nếu có
	 */
	hasComponent(entity, componentType) {
		return this._components.get(componentType)?.has(entity) || false;
	}

	/**
	 * Lấy component instance từ entity.
	 *
	 * @template T
	 * @overload
	 * @param {number} entity ID entity
	 * @param {new (...args: any[]) => T} componentType Class của component
	 * @param {true} [strict] Có throw lỗi khi không tìm thấy không
	 * @returns {T} Instance của component
	 *
	 * @template T
	 * @overload
	 * @param {number} entity ID entity
	 * @param {new (...args: any[]) => T} componentType Class của component
	 * @param {false} strict Có throw lỗi khi không tìm thấy không
	 * @returns {T | null} Instance của component hoặc null
	 *
	 * @template T
	 * @param {number} entity ID entity
	 * @param {new (...args: any[]) => T} componentType Class của component
	 * @param {boolean} [strict=true] Có throw lỗi khi không tìm thấy không
	 * @returns {T | null} Instance của component
	 * @throws {Error} Khi không tìm thấy component và strict=true
	 */
	getComponent(entity, componentType, strict = true) {
		const component = this._components.get(componentType)?.get(entity);

		if (component == null && strict) {
			throw new Error(`Component ${componentType.name} not found on entity ${entity}`);
		}

		return component || null;
	}

	/**
	 * Lấy toàn bộ entity có component chỉ định.
	 *
	 * @template T
	 * @param {new (...args: any[]) => T} componentType Class của component
	 * @returns {Map<number, T>} Map<entityId, componentInstance>
	 */
	getEntitiesWithComponent(componentType) {
		return this._components.get(componentType) || new Map();
	}

	/**
	 * Lấy danh sách entity có tất cả các component truyền vào.
	 *
	 * @template {readonly [...(new (...args: any[]) => any)[]]} const T
	 * @param {T} componentTypes Danh sách class component
	 * @returns {Map<number, { [K in keyof T]: T[K] extends new (...args: any[]) => infer R ? R : never }>} Map<entityId, [component1, component2, ...]> theo đúng thứ tự input
	 */
	getEntitiesWithComponents(componentTypes) {
		if (componentTypes.length === 0) return new Map();
		if (componentTypes.length === 1) {
			const map = this.getEntitiesWithComponent(componentTypes[0]);
			const result = new Map();
			for (const [entity, comp] of map) result.set(entity, [comp]);
			return result;
		}

		// Lấy danh sách Map<entity, component> của từng component
		const maps = componentTypes.map((t) => this._components.get(t) || new Map());

		// Sắp xếp để duyệt map nhỏ nhất trước, nhưng giữ lại index gốc
		const indexedMaps = maps.map((map, index) => ({ map, index }));
		indexedMaps.sort((a, b) => a.map.size - b.map.size);

		const result = new Map();

		for (const [entity] of indexedMaps[0].map) {
			// Nếu entity có trong tất cả maps => thêm vào kết quả
			if (indexedMaps.every(({ map }) => map.has(entity))) {
				// Tạo array components theo đúng thứ tự input (không phải sorted order)
				const components = componentTypes.map((_, i) => maps[i].get(entity));
				result.set(entity, components);
			}
		}

		return result;
	}
}
