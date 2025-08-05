class SpriteSheetTool {
	constructor() {
		this.sourceImage = null;
		this.spriteSheetData = null;
		this.animationId = null;
		this.currentFrame = 0;
		this.isAnimating = false;
		this.lastFrameTime = 0;

		this.initElements();
		this.bindEvents();
		this.updateDisplays();
	}

	initElements() {
		this.elements = {
			upload: document.getElementById('upload'),
			frameCount: document.getElementById('frameCount'),
			paddingRatio: document.getElementById('paddingRatio'),
			scaleFactor: document.getElementById('scaleFactor'),
			maxWidth: document.getElementById('maxWidth'),
			animationSpeed: document.getElementById('animationSpeed'),
			flightAngle: document.getElementById('flightAngle'),
			preview: document.getElementById('preview'),
			sheet: document.getElementById('sheet'),
			manifest: document.getElementById('manifest'),
			generate: document.getElementById('generate'),
			animate: document.getElementById('animate'),
			export: document.getElementById('export'),
			status: document.getElementById('status'),
			frameCountDisplay: document.getElementById('frameCountDisplay'),
			paddingDisplay: document.getElementById('paddingDisplay'),
			scaleDisplay: document.getElementById('scaleDisplay'),
			speedDisplay: document.getElementById('speedDisplay'),
			angleDisplay: document.getElementById('angleDisplay'),
		};

		this.previewCtx = this.elements.preview.getContext('2d');
		this.sheetCtx = this.elements.sheet.getContext('2d');
	}

	bindEvents() {
		this.elements.upload.addEventListener('change', (e) => this.handleImageLoad(e));
		this.elements.frameCount.addEventListener('input', () => this.updateDisplays());
		this.elements.paddingRatio.addEventListener('input', () => this.updateDisplays());
		this.elements.scaleFactor.addEventListener('input', () => this.updateDisplays());
		this.elements.animationSpeed.addEventListener('input', () => this.updateDisplays());
		this.elements.flightAngle.addEventListener('input', () => this.updatePreview());
		this.elements.generate.addEventListener('click', () => this.generateSpriteSheet());
		this.elements.animate.addEventListener('click', () => this.toggleAnimation());
		this.elements.export.addEventListener('click', () => this.exportFiles());
	}

	updateDisplays() {
		this.elements.frameCountDisplay.textContent = this.elements.frameCount.value;
		this.elements.paddingDisplay.textContent = this.elements.paddingRatio.value;
		this.elements.scaleDisplay.textContent = this.elements.scaleFactor.value + 'x';
		this.elements.speedDisplay.textContent = this.elements.animationSpeed.value + ' fps';
		this.elements.angleDisplay.textContent = this.elements.flightAngle.value + '°';
		this.updatePreview();
	}

	showStatus(message, type = 'success') {
		this.elements.status.textContent = message;
		this.elements.status.className = `status ${type}`;
		this.elements.status.style.display = 'block';

		setTimeout(() => {
			this.elements.status.style.display = 'none';
		}, 3000);
	}

	handleImageLoad(e) {
		const file = e.target.files[0];
		if (!file) return;

		const img = new Image();
		img.onload = () => {
			this.sourceImage = img;
			this.updatePreview();
			this.showStatus('Image loaded successfully!');
		};
		img.src = URL.createObjectURL(file);
	}

	updatePreview() {
		if (!this.sourceImage) return;

		const canvas = this.elements.preview;
		const ctx = this.previewCtx;
		const paddingRatio = parseFloat(this.elements.paddingRatio.value);

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Calculate content size (excluding padding)
		const contentWidth = this.sourceImage.width * (1 - 2 * paddingRatio);
		const contentHeight = this.sourceImage.height * (1 - 2 * paddingRatio);

		// Calculate scale to fit preview based on CONTENT size
		const scaleX = (canvas.width * 0.8) / contentWidth;
		const scaleY = (canvas.height * 0.8) / contentHeight;
		const scale = Math.min(scaleX, scaleY);

		const scaledW = this.sourceImage.width * scale;
		const scaledH = this.sourceImage.height * scale;

		// Save context
		ctx.save();

		// Move to center and apply flight angle rotation
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate((this.elements.flightAngle.value * Math.PI) / 180);

		// Draw the image centered
		ctx.drawImage(this.sourceImage, -scaledW / 2, -scaledH / 2, scaledW, scaledH);

		ctx.restore();
	}

	generateSpriteSheet() {
		if (!this.sourceImage) {
			this.showStatus('Please select an image first!', 'error');
			return;
		}

		const frameCount = parseInt(this.elements.frameCount.value);
		const paddingRatio = parseFloat(this.elements.paddingRatio.value);
		const scaleFactor = parseFloat(this.elements.scaleFactor.value);
		const maxSheetWidth = parseInt(this.elements.maxWidth.value);

		// Apply scale factor to frame dimensions
		const frameW = Math.round(this.sourceImage.width * scaleFactor);
		const frameH = Math.round(this.sourceImage.height * scaleFactor);

		// Calculate padding
		const padX = Math.round(frameW * paddingRatio);
		const padY = Math.round(frameH * paddingRatio);
		const paddedW = frameW + padX * 2;
		const paddedH = frameH + padY * 2;

		// Calculate grid layout
		const cols = Math.floor(maxSheetWidth / paddedW);
		const rows = Math.ceil(frameCount / cols);

		// Setup sheet canvas
		const sheetCanvas = this.elements.sheet;
		sheetCanvas.width = paddedW * cols;
		sheetCanvas.height = paddedH * rows;

		const manifest = {
			'padding-ratio': paddingRatio,
			'frame-size': { width: paddedW, height: paddedH },
			'frames-position': [],
		};

		// Generate frames
		for (let i = 0; i < frameCount; i++) {
			const angle = (i * 2 * Math.PI) / frameCount;

			// Create temporary canvas for rotation
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = paddedW;
			tempCanvas.height = paddedH;
			const tempCtx = tempCanvas.getContext('2d');

			// Rotate and draw with scale factor
			tempCtx.translate(paddedW / 2, paddedH / 2);
			tempCtx.rotate(angle);
			tempCtx.drawImage(this.sourceImage, -frameW / 2, -frameH / 2, frameW, frameH);

			// Position in sheet
			const col = i % cols;
			const row = Math.floor(i / cols);
			const x = Math.round(col * paddedW);
			const y = Math.round(row * paddedH);

			this.sheetCtx.drawImage(tempCanvas, x, y);

			manifest['frames-position'].push({ x, y });
		}

		this.spriteSheetData = manifest;
		this.elements.manifest.textContent = JSON.stringify(manifest, null, 2);

		// Enable controls
		this.elements.animate.disabled = false;
		this.elements.export.disabled = false;

		this.showStatus(`Sprite sheet generated with ${frameCount} frames at ${scaleFactor}x scale!`);
	}

	toggleAnimation() {
		if (this.isAnimating) {
			this.stopAnimation();
		} else {
			this.startAnimation();
		}
	}

	startAnimation() {
		if (!this.spriteSheetData) return;

		this.isAnimating = true;
		this.elements.animate.textContent = 'Stop Animation';
		this.lastFrameTime = performance.now();

		const animate = (currentTime) => {
			if (!this.isAnimating) return;

			const fps = parseInt(this.elements.animationSpeed.value);
			const frameInterval = 1000 / fps; // milliseconds per frame

			if (currentTime - this.lastFrameTime >= frameInterval) {
				this.currentFrame = (this.currentFrame + 1) % this.spriteSheetData['frames-position'].length;
				this.renderAnimationFrame();
				this.lastFrameTime = currentTime;
			}

			this.animationId = requestAnimationFrame(animate);
		};

		this.animationId = requestAnimationFrame(animate);
	}

	stopAnimation() {
		this.isAnimating = false;
		this.elements.animate.textContent = 'Start Animation';

		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	renderAnimationFrame() {
		if (!this.spriteSheetData || !this.elements.sheet.width) return;

		const canvas = this.elements.preview;
		const ctx = this.previewCtx;
		const frame = this.spriteSheetData['frames-position'][this.currentFrame];
		const frameSize = this.spriteSheetData['frame-size'];
		const paddingRatio = this.spriteSheetData['padding-ratio'];

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Calculate content size (excluding padding)
		const contentWidth = frameSize.width * (1 - 2 * paddingRatio);
		const contentHeight = frameSize.height * (1 - 2 * paddingRatio);

		// Calculate scale based on CONTENT size
		const scaleX = (canvas.width * 0.8) / contentWidth;
		const scaleY = (canvas.height * 0.8) / contentHeight;
		// const scaleX = canvas.width / contentWidth;
		// const scaleY = canvas.height / contentHeight;
		const scale = Math.min(scaleX, scaleY);

		const scaledW = frameSize.width * scale;
		const scaledH = frameSize.height * scale;

		// Draw frame from sprite sheet
		ctx.drawImage(
			this.elements.sheet,
			frame.x,
			frame.y,
			frameSize.width,
			frameSize.height,
			(canvas.width - scaledW) / 2,
			(canvas.height - scaledH) / 2,
			scaledW,
			scaledH
		);
	}

	async exportFiles() {
		if (!this.spriteSheetData) {
			this.showStatus('Generate sprite sheet first!', 'error');
			return;
		}

		try {
			// Request directory handle
			const directoryHandle = await window.showDirectoryPicker();

			// Export manifest
			const manifestData = JSON.stringify(this.spriteSheetData, null, 2);
			const manifestFile = await directoryHandle.getFileHandle('manifest.json', { create: true });
			const manifestWritable = await manifestFile.createWritable();
			await manifestWritable.write(manifestData);
			await manifestWritable.close();

			// Export sprite sheet as WebP
			const blob = await new Promise((resolve) => {
				this.elements.sheet.toBlob(resolve, 'image/webp', 0.9);
			});

			const spriteFile = await directoryHandle.getFileHandle('sprite.webp', { create: true });
			const spriteWritable = await spriteFile.createWritable();
			await spriteWritable.write(blob);
			await spriteWritable.close();

			this.showStatus('Files exported successfully!');
		} catch (error) {
			if (error.name !== 'AbortError') {
				this.showStatus('Export failed: ' + error.message, 'error');
			}
		}
	}
}

// Initialize the tool
new SpriteSheetTool();
