const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const angleInput = document.getElementById('angleInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

const spritePath = 'assets/s1.sprite.png';
const manifestPath = 'assets/s1.sprite.manifest.json';

const FRAME_COUNT = 60;
const DRAW_SIZE = 160; // 40x40 vẽ trên canvas

const { width, height } = canvas.getBoundingClientRect();
canvas.width = width;
canvas.height = height;

let spriteImage = new Image();
let manifest = {};
let frameIndex = 0;

let pos = { x: 200, y: 200 };
let velocity = { x: 0, y: 0 };

let isRunning = false;

function degToRad(deg) {
	return (deg * Math.PI) / 180;
}

function loadManifestAndSprite(callback) {
	fetch(manifestPath)
		.then((res) => res.json())
		.then((json) => {
			manifest = json;
			spriteImage.onload = callback;
			spriteImage.src = spritePath;
		});
}

function updatePosition() {
	pos.x += velocity.x;
	pos.y += velocity.y;

	// Wrap nếu ra khỏi màn hình
	if (pos.x > canvas.width) pos.x = 0;
	if (pos.y > canvas.height) pos.y = 0;
	if (pos.x < 0) pos.x = canvas.width;
	if (pos.y < 0) pos.y = canvas.height;
}

function drawFrame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const frameName = `frame_${frameIndex}`;
	const frame = manifest[frameName];
	if (!frame) return;

	const paddingRatio = 0.15;

	// Kích thước phần nội dung thực (không tính padding)
	const contentWidth = frame.width * (1 - 2 * paddingRatio);
	const contentHeight = frame.height * (1 - 2 * paddingRatio);

	const scaleX = DRAW_SIZE / contentWidth;
	const scaleY = DRAW_SIZE / contentHeight;
	const scale = Math.min(scaleX, scaleY);

	const targetW = frame.width * scale;
	const targetH = frame.height * scale;

	// Tính góc bay hiện tại (dựa trên velocity)
	const angleRad = Math.atan2(velocity.y, velocity.x);

	ctx.save();

	// Di chuyển hệ trục đến vị trí quả bóng
	ctx.translate(pos.x, pos.y);

	// Xoay theo góc bay
	ctx.rotate(angleRad);

	// Vẽ sprite đã xoay và scale
	ctx.drawImage(spriteImage, frame.x, frame.y, frame.width, frame.height, -targetW / 2, -targetH / 2, targetW, targetH);

	// Vẽ khung chữ nhật bao sprite sau khi scale (để kiểm chứng)
	ctx.strokeStyle = 'lime';
	ctx.lineWidth = 1;
	ctx.strokeRect(-targetW / 2, -targetH / 2, targetW, targetH);

	ctx.restore();

	// Vẽ chấm đỏ tại vị trí thực tế (tâm)
	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
	ctx.fill();

	frameIndex = (frameIndex + 1) % FRAME_COUNT;
}

function loop() {
	if (!isRunning) return;

	updatePosition();
	drawFrame();

	requestAnimationFrame(loop);
}

startBtn.addEventListener('click', () => {
	const angleDeg = parseFloat(angleInput.value) || 0;
	const angleRad = degToRad(angleDeg);

	velocity.x = Math.cos(angleRad) * 2.5; // tốc độ bay
	velocity.y = Math.sin(angleRad) * 2.5;
	isRunning = true;
	loop();
});

pauseBtn.addEventListener('click', () => (isRunning = !isRunning));

loadManifestAndSprite(() => {
	console.log('Sprite & manifest loaded.');
});
