/**
 * Ép kiểu và kiểm tra nếu `value` là instance của `Type`, nếu không thì ném lỗi.
 *
 * @template T
 * @param {unknown} value
 * @param {new (...args: any[]) => T} Type
 * @returns {T}
 * @throws {TypeError} Khi `value` không phải instance của `Type`
 */
export function asInstanceOf(value, Type) {
	if (value instanceof Type) return value;

	console.error(`Value is not instance of '${Type.name}'`, value);
	throw new TypeError(`Value is not instance of '${Type.name}'`);
}

/**
 * @param {() => void} runable
 * @param {(error: Error) => void} errorHandler
 */
export function safeArea(runable, errorHandler = (error) => console.error(`Error in safeArea:`, error)) {
	try {
		if (typeof runable !== 'function') {
			console.warn(`Error in safeArea, runable is not a function, ignore run:`, runable);
			return;
		}
		runable();
	} catch (error) {
		errorHandler(error);
	}
}
