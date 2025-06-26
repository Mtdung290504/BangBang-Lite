/**
 * Debug a variable by logging it to the console and displaying it in a draggable debug view.
 *
 * @param {any} variable - The variable to watch (passed by reference).
 * @param {Object} [options]
 * @param {number} [options.fps=30] - Update frequency limit.
 * @param {Object} [options.style={}] - Additional CSS styles.
 * @returns {{ destroy: () => void, hide: () => void, show: () => void, export: (name: string) => void }}
 */
export default function debugVariable(variable = {}, { fps = 30, style = {} } = {}) {
	console.log('Debugging variable:', variable);

	const el = document.createElement('pre');

	Object.assign(el.style, {
		position: 'fixed',
		top: '10px',
		left: '10px',
		background: '#333',
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

	const update = (time) => {
		if (!isDestroyed) {
			if (isVisible && time - lastUpdate >= interval) {
				el.textContent = safeStringify(variable);
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
