/**
 * Memoize options.
 *
 * @typedef {Object} MemoizeOptions
 * @property {number} [ttl] - Time to live in milliseconds. If not provided, cache never expires
 * @property {number} [maxSize] - Maximum number of cached items. When exceeded, oldest items are removed
 */

/**
 * Cache entry with expiration.
 *
 * @template T
 *
 * @typedef {Object} CacheEntry
 * @property {T} value - The cached value
 * @property {number} [expiry] - Expiration timestamp (undefined means no expiry)
 * @property {number} timestamp - When this entry was created
 */

/**
 * A memoized version of the original function.
 *
 * @template {(...args: any[]) => any} Fn
 *
 * @typedef {((...args: Parameters<Fn>) => ReturnType<Fn>) & {
 * 		clear: () => void,
 * 		delete: (...args: Parameters<Fn>) => boolean,
 * 		has: (...args: Parameters<Fn>) => boolean,
 * 		size: () => number
 * }} MemoizedFunction
 */

/**
 * Memoizes a given function by caching its computed results.
 *
 * @template {(...args: any[]) => any} Fn
 *
 * @param {Fn} fn - The function to memoize
 * @param {MemoizeOptions} [options] - Memoization options
 *
 * @returns {MemoizedFunction<Fn>} A new memoized version of the function
 */
export function memoize(fn, options) {
	const { ttl, maxSize } = options || {};

	/** @type {Map<string, CacheEntry<ReturnType<Fn>>>} */
	const cache = new Map();

	/** @type {WeakMap<object, CacheEntry<ReturnType<Fn>>>} */
	const objectCache = new WeakMap();

	const functionName = fn.name;

	/**
	 * Cleanup expired entries from cache
	 * @returns {void}
	 */
	function cleanupExpired() {
		if (!ttl) return;

		const now = Date.now();
		for (const [key, entry] of cache.entries()) {
			if (entry.expiry && now > entry.expiry) {
				cache.delete(key);
			}
		}
	}

	/**
	 * Enforce max size limit by removing oldest entries
	 * @returns {void}
	 */
	function enforceMaxSize() {
		if (!maxSize || cache.size <= maxSize) return;

		// Sort by timestamp and remove oldest entries
		const entries = Array.from(cache.entries()).sort(([, a], [, b]) => a.timestamp - b.timestamp);

		const toRemove = entries.slice(0, cache.size - maxSize);
		toRemove.forEach(([key]) => cache.delete(key));
	}

	/**
	 * Gets cached value if exists and not expired
	 *
	 * @param {string | object} key - The cache key
	 * @returns {ReturnType<Fn> | undefined} Cached value or undefined
	 */
	function getCachedValue(key) {
		let entry;

		if (typeof key === 'object' && key !== null) {
			entry = objectCache.get(key);
		} else {
			entry = cache.get(key);
		}

		if (!entry) return undefined;

		// Check if expired
		if (entry.expiry && Date.now() > entry.expiry) {
			if (typeof key === 'object' && key !== null) {
				objectCache.delete(key);
			} else {
				cache.delete(key);
			}
			return undefined;
		}

		return entry.value;
	}

	/**
	 * Sets cached value with optional expiry
	 *
	 * @param {string | object} key - The cache key
	 * @param {ReturnType<Fn>} value - The value to cache
	 *
	 * @returns {void}
	 */
	function setCachedValue(key, value) {
		const now = Date.now();
		const entry = {
			value,
			expiry: ttl ? now + ttl : undefined,
			timestamp: now,
		};

		if (typeof key === 'object' && key !== null) {
			objectCache.set(key, entry);
		} else {
			cache.set(key, entry);
			enforceMaxSize();
		}
	}

	/**
	 * Generates a cache key based on the arguments.
	 *
	 * @param {Parameters<Fn>} args - The arguments provided to the function
	 * @returns {string | object} A cache key which can be a string or an object
	 */
	function getCacheKey(args) {
		return args.length === 1 ? args[0] : JSON.stringify(args);
	}

	/**
	 * The memoized function
	 * @type {MemoizedFunction<Fn>}
	 */
	const memoized = function (...args) {
		// Cleanup expired entries periodically
		cleanupExpired();

		const key = getCacheKey(args);
		const cachedValue = getCachedValue(key);

		if (cachedValue !== undefined) {
			console.log(`> [Memoize] Return result from cache for call:[${functionName}] with args:`, args);
			return cachedValue;
		}

		let result;

		try {
			result = fn.apply(this, args);
		} catch (error) {
			throw error;
		}

		if (result instanceof Promise) {
			result = result.catch((error) => {
				// Remove from cache if promise fails
				if (typeof key === 'object' && key !== null) {
					objectCache.delete(key);
				} else {
					cache.delete(key);
				}
				throw error;
			});
		}

		setCachedValue(key, result);
		return result;
	};

	/**
	 * Clear all cached results
	 * @returns {void}
	 */
	memoized.clear = () => {
		cache.clear();
		// Note: WeakMap doesn't have clear() method
		// Objects will be garbage collected when no longer referenced
	};

	/**
	 * Delete a specific cached result
	 *
	 * @param {Parameters<Fn>} args - The arguments to delete from cache
	 * @returns {boolean} True if the item was successfully deleted
	 */
	memoized.delete = (...args) => {
		const key = getCacheKey(args);

		if (typeof key === 'object' && key !== null) {
			const existed = objectCache.has(key);
			objectCache.delete(key);
			return existed;
		} else {
			return cache.delete(key);
		}
	};

	/**
	 * Check if a result is cached and not expired
	 *
	 * @param {Parameters<Fn>} args - The arguments to check
	 * @returns {boolean} True if the result is cached and valid
	 */
	memoized.has = (...args) => {
		cleanupExpired();
		const key = getCacheKey(args);
		return getCachedValue(key) !== undefined;
	};

	/**
	 * Get current cache size (excluding WeakMap)
	 * @returns {number} Number of cached items
	 */
	memoized.size = () => {
		cleanupExpired();
		return cache.size;
	};

	return memoized;
}
