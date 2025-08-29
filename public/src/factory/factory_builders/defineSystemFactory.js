import EntityManager from '../../core/managers/battle/mgr.Entity.js';

/**
 * @template {[...(new (...args: any[]) => any)[]]} const PrimaryComponents
 * @template {(new (...args: any[]) => any) | undefined} [ContextClass=undefined]
 */
class SystemFactoryBuilder {
	/**
	 * @param {PrimaryComponents} components
	 * @param {ContextClass | undefined} CtxClass
	 */
	constructor(components, CtxClass) {
		this.primaryComponents = components;

		/** @type {ContextClass | undefined} */
		this.CtxClass = CtxClass;

		/** @type {Function | null} */
		this._processor = null;

		/** @type {Function | null} */
		this._init = null;

		/** @type {Function | null} */
		this._teardown = null;
	}

	/**
	 * Processor cho system
	 * @param {ContextClass extends undefined
	 * 		? (context: EntityManager, eID: number, components: {[K in keyof PrimaryComponents]: PrimaryComponents[K] extends new (...args: any[]) => infer R ? R : never}) => void
	 * 		: (context: EntityManager, eID: number, components: {[K in keyof PrimaryComponents]: PrimaryComponents[K] extends new (...args: any[]) => infer R ? R : never}, sysContext: InstanceType<NonNullable<ContextClass>>) => void
	 * } fn
	 */
	withProcessor(fn) {
		this._processor = fn;
		return this;
	}

	/**
	 * Hàm init (tùy chọn)
	 * @param {ContextClass extends undefined
	 * 		? () => void
	 * 		: (sysContext: InstanceType<NonNullable<ContextClass>>) => void
	 * } fn
	 */
	withInit(fn) {
		this._init = fn;
		return this;
	}

	/**
	 * Hàm teardown (tùy chọn)
	 * @param {ContextClass extends undefined
	 * 		? () => void
	 * 		: (sysContext: InstanceType<NonNullable<ContextClass>>) => void
	 * } fn
	 */
	withTeardown(fn) {
		this._teardown = fn;
		return this;
	}

	/**
	 * Hoàn thành tạo ra factory
	 */
	build() {
		const primaryComponents = this.primaryComponents;
		const CtxClass = this.CtxClass;
		const processor = this._processor;
		const init = this._init;
		const teardown = this._teardown;

		/**
		 * @param {ContextClass extends undefined ? [context: EntityManager] : [context: EntityManager, ...ConstructorParameters<NonNullable<ContextClass>>]} args
		 */
		function create(...args) {
			/** @type {any} */
			let ctx = null;
			if (CtxClass) ctx = new CtxClass(...args);

			return {
				primaryComponents,

				/**@type {ContextClass extends undefined ? never : InstanceType<ContextClass>} */
				sysContext: ctx,

				/**
				 * @param {number} eid
				 * @param {{
				 * 		[K in keyof PrimaryComponents]:
				 * 			PrimaryComponents[K] extends new (...args: any[]) => infer R ? R : never
				 * }} components
				 */
				process(eid, components) {
					if (!processor) return;
					if (ctx !== null) processor(ctx, eid, components);
					else processor(eid, components);
				},

				init() {
					if (!init) return;
					if (ctx !== null) init(ctx);
					else init();
				},

				teardown() {
					if (!teardown) return;
					if (ctx !== null) teardown(ctx);
					else teardown();
				},
			};
		}

		return { create };
	}
}

/**
 * Factory khởi tạo system builder
 *
 * @template {[...(new (...args: any[]) => any)[]]} const PrimaryComponents
 * @template {(new (...args: any[]) => any) | undefined} [ContextClass=undefined]
 *
 * @param {PrimaryComponents} components
 * @param {ContextClass} [ctxClass]
 */
export default function defineSystemFactory(components, ctxClass) {
	return new SystemFactoryBuilder(components, ctxClass);
}
