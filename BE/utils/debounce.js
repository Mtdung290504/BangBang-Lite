/**
 * Additional debounce options.
 *
 * @typedef {Object} DebounceOptions
 * @property {boolean} [immediate=false] - Whether to execute the function immediately.
 */

/**
 * A debounced version of the original function.
 *
 * @template {(...args: any[]) => any} Fn
 *
 * @typedef {((...args: Parameters<Fn>) => Promise<ReturnType<Fn>>) & {
 * 		cancel: () => void,
 * 		flush: () => Promise<ReturnType<Fn> | undefined>
 * }} DebouncedFunction
 */

/**
 * Creates a debounced version of the provided function.
 *
 * @template {(...args: any[]) => any} Fn
 *
 * @param {Fn} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {DebounceOptions} [options] - Additional debounce options
 *
 * @returns {DebouncedFunction<Fn>} A debounced version of the provided function
 */
export default function debounce(func, wait, options) {
	const immediate = options?.immediate ?? false;

	let timeout = null;
	let pendingPromise = null;
	let lastArgs = null;
	let lastThis = null;

	/**
	 * The debounced function
	 * @type {DebouncedFunction<Fn>}
	 */
	const debounced = function (...args) {
		lastArgs = args;
		lastThis = this;

		if (timeout) clearTimeout(timeout);

		return new Promise((resolve, reject) => {
			const later = () => {
				timeout = null;
				pendingPromise = null;

				if (!immediate) {
					const result = func.apply(lastThis, lastArgs);
					Promise.resolve(result).then(resolve, reject);
				}
			};

			const callNow = immediate && !timeout;

			timeout = setTimeout(later, wait);

			if (callNow) {
				const result = func.apply(lastThis, lastArgs);
				Promise.resolve(result).then(resolve, reject);
			} else {
				pendingPromise = { resolve, reject };
			}
		});
	};

	/**
	 * Cancel any pending function execution
	 * @returns {void}
	 */
	debounced.cancel = () => {
		if (timeout) clearTimeout(timeout);
		timeout = null;
		if (pendingPromise) {
			pendingPromise.reject(new Error('Debounced function canceled'));
			pendingPromise = null;
		}
	};

	/**
	 * Immediately invoke the pending function (if any)
	 * @returns {Promise<any | undefined>} Promise that resolves with the function result or undefined
	 */
	debounced.flush = () => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
			const result = func.apply(lastThis, lastArgs);
			return Promise.resolve(result);
		}
		return Promise.resolve(undefined);
	};

	return debounced;
}
