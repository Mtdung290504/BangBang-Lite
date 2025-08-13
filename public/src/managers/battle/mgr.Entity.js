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
	 * @template T
	 * @param {number} entity ID entity
	 * @param {T} component Instance của component
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
	 * Xóa một component khỏi entity.
	 *
	 * @template T
	 * @param {number} entity ID entity
	 * @param {new (...args: any[]) => T} componentType Class của component
	 */
	removeComponent(entity, componentType) {
		this._components.get(componentType)?.delete(entity);
	}

	/**
	 * Kiểm tra entity có component chỉ định không.
	 *
	 * @template T
	 * @param {number} entity ID entity
	 * @param {new (...args: any[]) => T} componentType Class của component
	 * @returns {boolean} true nếu có
	 */
	hasComponent(entity, componentType) {
		return this._components.get(componentType)?.has(entity) || false;
	}

	/**
	 * Lấy component instance từ entity.
	 *
	 * @template T
	 * @param {number} entity ID entity
	 * @param {new (...args: any[]) => T} componentType Class của component
	 * @returns {T | null} Instance nếu có, null nếu không
	 */
	getComponent(entity, componentType) {
		return this._components.get(componentType)?.get(entity) || null;
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
	 * @param {Array<Function>} componentTypes Danh sách class component
	 * @returns {number[]} Mảng entity ID
	 */
	getEntitiesWithComponents(componentTypes) {
		if (componentTypes.length === 0) return [];

		// Lấy danh sách Map<entity, component> của từng component
		const maps = componentTypes.map((t) => this._components.get(t) || new Map());

		// Sắp xếp để duyệt map nhỏ nhất trước
		maps.sort((a, b) => a.size - b.size);

		const result = [];

		for (const [entity] of maps[0]) {
			// Nếu entity có trong tất cả maps => thêm vào kết quả
			if (maps.every((map) => map.has(entity))) {
				result.push(entity);
			}
		}

		return result;
	}

	/**
	 * Lấy toàn bộ entity hiện tại.
	 * @returns {number[]} Danh sách ID entity
	 */
	getAllEntities() {
		return Array.from(this._entities);
	}
}
