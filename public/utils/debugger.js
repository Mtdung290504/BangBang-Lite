// Configuration constants
const CONFIG = {
	// Performance settings
	fps: 10,
	maxStringLength: 100, // Ngưỡng để JSON xuống dòng

	// Visual settings
	colors: [
		// 'deepskyblue',
		'white',
	],

	// Layout settings
	margin: 10,
	minWidth: 200,
	maxWidth: 750,
	spacing: 15, // Khoảng cách giữa các debugger
	headerHeight: 40, // Chiều cao header
};

/**@type {{ destroy: () => void, hide: () => void, show: () => void, element: HTMLElement }[]} */
const registry = [];

const __debugger = {
	observe: debugVariable,

	showAll() {
		console.log('> [Debugger] Show all debuggers\n\n\n');
		for (const { show } of registry) show();
	},

	hideAll() {
		console.log('> [Debugger] Hide all debuggers\n\n\n');
		for (const { hide } of registry) hide();
	},

	destroyAll() {
		console.log('> [Debugger] Destroy all debuggers\n\n\n');
		for (const { destroy } of registry) destroy();
		registry.length = 0; // Clear registry
	},

	listen() {
		if (this.listening) return;
		console.log('> [Debugger] Started and running...\n\n\n');
		this.listening = true;

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

export default __debugger;

// Insert global CSS once
function ensureGlobalStyle() {
	if (document.getElementById('debugger-styles')) return;

	const globalStyle = document.createElement('style');
	globalStyle.id = 'debugger-styles';
	globalStyle.textContent = `
		.debugger-container {
			position: fixed;
			background: rgba(0, 0, 0, 0.85);
			border-radius: 6px;
			border: 1px solid rgba(255, 255, 255, 0.5);
			resize: both;
			overflow: hidden;
			font-family: Monaco, Consolas, "Courier New", monospace;
			font-size: 15px;
			line-height: 1.4;
			display: flex;
			flex-direction: column;
		}
		.debugger-header {
			background: rgba(255, 255, 255, 0.25);
			padding: 5px 10px;
			color: deepskyblue;
			font-size: 20px;
			font-weight: bold;
			cursor: grab;
			user-select: none;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			display: flex;
			align-items: center;
			letter-spacing: 0.5px;
			min-height: ${CONFIG.headerHeight}px;
		}
		.debugger-content {
			flex: 1;
			padding: 8px 12px;
			white-space: pre-wrap;
			user-select: text;
			overflow-y: auto;
			overflow-x: hidden;
			margin: 0;
		}

		.debugger-container pre::-webkit-scrollbar {
			width: 10px;
		}
		.debugger-container pre::-webkit-scrollbar-track {
			background: rgba(230, 230, 230, .2);
		}
		.debugger-container pre::-webkit-scrollbar-thumb {
			background: rgba(230, 230, 230, .8);
			border-radius: 5px;
			cursor: pointer;
		}
		.debugger-container pre::-webkit-scrollbar-thumb:active {
			background: rgba(230, 230, 230, .5);
		}
	`;
	document.head.appendChild(globalStyle);
}

/**
 * Debug a variable by logging it to the console and displaying it in a draggable debug view.
 *
 * @param {any} variable - The variable to watch (passed by reference).
 * @param {Object} [options]
 * @param {number} [options.fps] - Update frequency limit.
 * @param {string} [options.name] - Display name for the debugger.
 * @returns {{ destroy: () => void, hide: () => void, show: () => void, export: (name: string) => void }}
 */
function debugVariable(variable = {}, { fps = CONFIG.fps, name = '_' } = {}) {
	console.log('> [Debugger] Debugging variable:', variable);

	ensureGlobalStyle();

	// Container element
	const container = document.createElement('div');
	const header = document.createElement('div');
	const content = document.createElement('pre');

	container.className = 'debugger-container';
	header.className = 'debugger-header';
	content.className = 'debugger-content';

	let cache = '';
	let rafId = null;

	// Get color for this debugger (rotate through colors)
	const colorIndex = registry.length % CONFIG.colors.length;
	const debuggerColor = CONFIG.colors[colorIndex];

	// Calculate position based on registry length
	const position = calculatePosition(registry.length);
	const maxHeight = calculateMaxHeight(position.top);

	// Dynamic styles
	container.style.top = `${position.top}px`;
	container.style.left = `${position.left}px`;
	container.style.zIndex = `${position.zIndex}`;
	container.style.minWidth = `${CONFIG.minWidth}px`;
	container.style.maxWidth = `${CONFIG.maxWidth}px`;
	container.style.maxHeight = `${maxHeight}px`;
	container.style.color = debuggerColor;

	header.textContent = name;
	container.appendChild(header);
	container.appendChild(content);
	document.body.appendChild(container);

	let isDestroyed = false;
	let isVisible = true;
	let lastUpdate = 0;
	const interval = 1000 / fps;

	// Optimized update function
	const update = (time = 0) => {
		if (isDestroyed) return;

		// SKIP UPDATE completely when hidden - no cache check, no work at all
		if (!isVisible) {
			rafId = requestAnimationFrame(update);
			return;
		}

		// Check and update at same frequency as fps
		if (time - lastUpdate >= interval) {
			const newVal = smartStringify(variable);
			if (cache !== newVal) {
				cache = newVal;
				// Use textContent for better performance
				requestIdleCallback(
					() => {
						if (!isDestroyed && isVisible) {
							content.textContent = newVal;
						}
					},
					{ timeout: 16 }
				);
			}
			lastUpdate = time;
		}
		rafId = requestAnimationFrame(update);
	};
	rafId = requestAnimationFrame(update);

	// Drag functionality
	let isDragging = false;
	let startX = 0,
		startY = 0;
	let initialLeft = 0,
		initialTop = 0;

	const onMouseDown = (e) => {
		if (e.button !== 0 || e.target !== header) return; // Only left click on header
		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;
		initialLeft = parseInt(container.style.left);
		initialTop = parseInt(container.style.top);
		header.style.cursor = 'grabbing';
		e.preventDefault();
	};

	const onMouseMove = (e) => {
		if (!isDragging) return;

		const deltaX = e.clientX - startX;
		const deltaY = e.clientY - startY;

		// Constrain to viewport
		const newLeft = Math.max(0, Math.min(window.innerWidth - container.offsetWidth, initialLeft + deltaX));
		const newTop = Math.max(0, Math.min(window.innerHeight - container.offsetHeight, initialTop + deltaY));

		container.style.left = `${newLeft}px`;
		container.style.top = `${newTop}px`;
	};

	const onMouseUp = () => {
		if (!isDragging) return;
		isDragging = false;
		header.style.cursor = 'grab';
	};

	header.addEventListener('mousedown', onMouseDown);
	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('mouseup', onMouseUp);

	// Control functions
	const destroy = () => {
		if (isDestroyed) return;
		isDestroyed = true;

		if (rafId) cancelAnimationFrame(rafId);

		container.remove();
		// style.remove();

		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);

		// Remove from registry
		const index = registry.findIndex((item) => item.element === container);
		if (index > -1) registry.splice(index, 1);

		// Reposition remaining debuggers
		repositionDebuggers();
	};

	const hide = () => {
		if (!isVisible) return;
		isVisible = false;
		container.style.display = 'none';
	};

	const show = () => {
		if (isVisible) return;
		isVisible = true;
		container.style.display = '';
	};

	const debuggerItem = { destroy, hide, show, element: container };
	registry.push(debuggerItem);

	return {
		destroy,
		hide,
		show,
		export(exportName) {
			if (typeof window['debuggers'] === 'undefined') {
				window['debuggers'] = {};
			}
			window['debuggers'][exportName] = { destroy, hide, show, variable };
		},
	};
}

/**
 * Calculate optimal position for new debugger with intelligent layering
 * @param {number} index
 */
function calculatePosition(index) {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	const debuggerWidth = CONFIG.maxWidth + CONFIG.spacing;
	const debuggerHeight = 200;

	// Calculate how many debuggers can fit in viewport
	const maxCols = Math.floor((viewportWidth - CONFIG.margin * 2) / debuggerWidth) || 1;
	const maxRows = Math.floor((viewportHeight - CONFIG.margin * 2) / (debuggerHeight + CONFIG.spacing)) || 1;
	const maxPerLayer = maxCols * maxRows;

	// Determine layer and position within layer
	const layer = Math.floor(index / maxPerLayer);
	const indexInLayer = index % maxPerLayer;

	const col = indexInLayer % maxCols;
	const row = Math.floor(indexInLayer / maxCols);

	// Calculate base position
	let left = CONFIG.margin + col * debuggerWidth;
	let top = CONFIG.margin + row * (debuggerHeight + CONFIG.spacing);

	const layerOffset = layer * 20;
	left += layerOffset;
	top += layerOffset;

	// Ensure we don't go off-screen (fallback)
	if (left + CONFIG.maxWidth > viewportWidth) {
		left = viewportWidth - CONFIG.maxWidth - CONFIG.margin;
	}
	if (top + debuggerHeight > viewportHeight) {
		top = viewportHeight - debuggerHeight - CONFIG.margin;
	}

	// Higher z-index for newer layers
	const zIndex = 9999 + layer;
	return { left, top, zIndex };
}

/**
 * Calculate max height based on available viewport space
 * @param {number} top
 */
function calculateMaxHeight(top) {
	const availableHeight = window.innerHeight - top - CONFIG.margin - CONFIG.headerHeight;
	return Math.max(150, availableHeight); // Minimum 150px
}

/**
 * Reposition all debuggers after one is destroyed
 */
function repositionDebuggers() {
	registry.forEach((item, index) => {
		const position = calculatePosition(index);
		const maxHeight = calculateMaxHeight(position.top);

		item.element.style.left = `${position.left}px`;
		item.element.style.top = `${position.top}px`;
		item.element.style.zIndex = position.zIndex.toString();
		item.element.style.maxHeight = `${maxHeight}px`;

		// Update color for new position
		const colorIndex = index % CONFIG.colors.length;
		const newColor = CONFIG.colors[colorIndex];
		item.element.style.color = newColor;

		// Update header and scrollbar colors
		const header = item.element.querySelector('div');
		if (header) header.style.color = newColor;
	});
}

/**
 * Smart stringify with conditional formatting
 * @param {any} obj
 */
function smartStringify(obj) {
	const cache = new Set();

	// First pass - check if result would be short enough for single line
	let testResult;
	try {
		testResult = JSON.stringify(obj, (_, value) => {
			if (typeof value === 'object' && value !== null) {
				if (cache.has(value)) return '[Circular]';
				cache.add(value);
			}
			return serializeSpecialTypes(value);
		});
	} catch (e) {
		return `[Error: ${e.message}]`;
	}

	// Clear cache for second pass
	cache.clear();

	// Use single line if short, otherwise use formatted version
	const useFormatting = testResult.length > CONFIG.maxStringLength;
	const spaces = useFormatting ? 2 : 0;

	try {
		return JSON.stringify(
			obj,
			(_, value) => {
				if (typeof value === 'object' && value !== null) {
					if (cache.has(value)) return '[Circular]';
					cache.add(value);
				}
				return serializeSpecialTypes(value);
			},
			spaces
		);
	} catch (e) {
		return `[Error: ${e.message}]`;
	}
}

/**
 * Handle special types serialization
 * @param {any} value
 */
function serializeSpecialTypes(value) {
	if (value instanceof Map) {
		return {
			__type: 'Map',
			size: value.size,
			entries: Array.from(value.entries()).slice(0, 10),
		};
	}
	if (value instanceof Set) {
		return {
			__type: 'Set',
			size: value.size,
			values: Array.from(value.values()).slice(0, 10),
		};
	}
	if (value instanceof Date) {
		return {
			__type: 'Date',
			value: value.toISOString(),
		};
	}
	if (typeof value === 'function') {
		return `[Function: ${value.name || 'anonymous'}]`;
	}

	// Handle special DOM objects and other complex objects
	if (typeof value === 'object' && value !== null) {
		const constructor = value.constructor;
		const constructorName = constructor && constructor.name;

		// Check if it's a DOM element or special object that might stringify to {}
		if (constructorName && constructorName !== 'Object' && constructorName !== 'Array') {
			// Try to get some meaningful properties
			let preview = {};
			let hasProps = false;

			// For DOM elements, try to get useful info
			if (value.nodeType !== undefined) {
				if (value.id) preview.id = value.id;
				if (value.src) preview.src = value.src;
				if (value.href) preview.href = value.href;
				hasProps = Object.keys(preview).length > 0;
			} else {
				try {
					const keys = Object.keys(value);
					for (const key of keys) {
						if (typeof value[key] !== 'function') {
							preview[key] = value[key];
							hasProps = true;
						}
					}
				} catch (e) {}
			}

			// If we have properties, show them, otherwise just show constructor name
			if (hasProps) {
				return { __constructor: constructorName, ...preview };
			} else {
				return `{}: ${constructorName}`;
			}
		}
	}

	return value;
}
