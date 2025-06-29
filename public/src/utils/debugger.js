/**@type {{ destroy: () => void, hide: () => void, show: () => void }[]} */
const registry = [];

export default {
	observe: debugVariable,

	showAll() {
		console.log('> [Debugger] Show all debuggers');
		for (const { show } of registry) show();
	},

	hideAll() {
		console.log('> [Debugger] Hide all debuggers');
		for (const { hide } of registry) hide();
	},

	destroyAll() {
		console.log('> [Debugger] Destroy all debuggers');
		for (const { destroy } of registry) destroy();
	},

	listen() {
		if (this.listening) return;
		console.log('> [Debugger] Started and running...');
		if (!this.listening) this.listening = true;

		window.addEventListener('keydown', (e) => {
			const evKey = e.key.toLowerCase();
			if (e.ctrlKey && ['d', 'h', 'x'].includes(evKey)) {
				e.preventDefault();
				if (evKey === 'd') this.showAll();
				if (evKey === 'h') this.hideAll();
				if (evKey === 'x') this.destroyAll();
			}
		});
	},
};

/**
 * Debug a variable by logging it to the console and displaying it in a draggable debug view.
 *
 * @param {any} variable - The variable to watch (passed by reference).
 * @param {Object} [options]
 * @param {number} [options.fps=30] - Update frequency limit.
 * @param {Object} [options.style={}] - Additional CSS styles.
 * @returns {{ destroy: () => void, hide: () => void, show: () => void, export: (name: string) => void }}
 */
function debugVariable(variable = {}, { fps = 30, style = {} } = {}) {
	console.log('> [Debugger] Debugging variable:', variable);

	const el = document.createElement('pre');
	let cache = '';

	Object.assign(el.style, {
		position: 'fixed',
		top: '10px',
		left: '10px',
		background: 'rgba(0, 0, 0, .6)',
		color: 'deepskyblue',
		padding: '8px',
		zIndex: 9999,
		whiteSpace: 'pre-wrap',
		cursor: 'grab',
		userSelect: 'none',
		width: 'fit-content',
		height: 'fit-content',
		minWidth: '200px',
		maxHeight: '90vh',
		overflowY: 'auto',
		...style,
	});

	document.body.appendChild(el);

	let isDestroyed = false;
	let isVisible = true;

	let lastUpdate = 0;
	const interval = 1000 / fps;

	const update = (time = 0) => {
		if (!isDestroyed) {
			if (isVisible && time - lastUpdate >= interval) {
				const newVal = safeStringify(variable);
				if (cache !== newVal) {
					cache = newVal;
					el.textContent = newVal;
				}
				lastUpdate = time;
			}
			requestAnimationFrame(update);
		}
	};
	requestAnimationFrame(update);

	// Drag
	let isDragging = false,
		offsetX = 0,
		offsetY = 0;

	el.addEventListener('mousedown', (e) => {
		isDragging = true;
		offsetX = e.clientX - el.offsetLeft;
		offsetY = e.clientY - el.offsetTop;
		el.style.cursor = 'grabbing';
	});

	/**@param {MouseEvent} e */
	const onMove = (e) => {
		if (isDragging) {
			el.style.left = `${e.clientX - offsetX}px`;
			el.style.top = `${e.clientY - offsetY}px`;
		}
	};

	const onUp = () => {
		isDragging = false;
		el.style.cursor = 'grab';
	};

	window.addEventListener('mousemove', onMove);
	window.addEventListener('mouseup', onUp);

	// Controls
	const destroy = () => {
		if (isDestroyed) return;
		isDestroyed = true;
		el.remove();
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onUp);
	};

	const hide = () => {
		if (!isVisible) return;
		isVisible = false;
		el.style.display = 'none';
	};

	const show = () => {
		if (isVisible) return;
		isVisible = true;
		el.style.display = '';
	};

	registry.push({ destroy, hide, show });

	return {
		destroy,
		hide,
		show,
		export(name) {
			if (window['debuggers'] === undefined) {
				window['debuggers'] = {};
			}
			window['debuggers'][name] = {
				destroy,
				hide,
				show,
				variable,
			};
		},
	};
}

/**
 * @param {any} obj
 * @param {number} space
 */
function safeStringify(obj, space = 3) {
	const cache = new Set();
	return JSON.stringify(
		obj,
		(_, value) => {
			if (typeof value === 'object' && value !== null) {
				if (cache.has(value)) return '[Circular]';
				cache.add(value);
			}
			if (value instanceof Map) {
				return {
					__type: 'Map',
					value: Array.from(value.entries()),
				};
			}
			if (value instanceof Set) {
				return {
					__type: 'Set',
					value: Array.from(value.values()),
				};
			}
			return value;
		},
		space
	);
}
