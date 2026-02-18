#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy đường dẫn của file hiện tại
const __filename = fileURLToPath(import.meta.url);

// Danh sách các phần mở rộng file code phổ biến
const CODE_EXTENSIONS = [
	'.js',
	'.jsx',
	'.ts',
	'.tsx',
	'.vue',
	'.svelte',
	'.py',
	'.java',
	'.c',
	'.cpp',
	'.h',
	'.hpp',
	'.cs',
	'.php',
	'.rb',
	'.go',
	'.rs',
	'.swift',
	'.kt',
	'.scala',
	'.r',
	'.m',
	'.mm',
	'.html',
	'.htm',
	'.css',
	'.scss',
	'.sass',
	'.less',
	'.xml',
	'.json',
	'.yaml',
	'.yml',
	'.toml',
	'.sql',
	'.sh',
	'.bat',
	'.ps1',
	'.dockerfile',
	'.env',
	'.gitignore',
	'.gitattributes',
	'.config',
	'.conf',
	'.ini',
];

// Các thư mục nên bỏ qua
const IGNORE_DIRS = [
	'node_modules',
	'.git',
	'.svn',
	'vendor',
	'build',
	'dist',
	'out',
	'.next',
	'.nuxt',
	'coverage',
	'__pycache__',
	'.pytest_cache',
	'.vscode',
	'.idea',
	'target',
	'bin',
	'obj',
	'.gradle',
];

// Các file nên bỏ qua
const IGNORE_FILES = [
	'package-lock.json',
	'yarn.lock',
	'composer.lock',
	'.DS_Store',
	'Thumbs.db',
	'*.log',
	'*.tmp',
	'*.md',
	'*.txt',
	'.scan-output.md', // Bỏ qua file output của tool
	'jsconfig.json',
	'tsconfig.json',
];

/**
 * @param {string} dirName
 */
function shouldIgnoreDir(dirName) {
	return IGNORE_DIRS.includes(dirName);
}

/**
 * @param {string} fileName
 * @param {string} fullPath
 */
function shouldIgnoreFile(fileName, fullPath) {
	// Bỏ qua chính file tool này
	if (path.resolve(fullPath) === path.resolve(__filename)) {
		return true;
	}

	// Bỏ qua file output của tool trước đó
	if (fileName === '.scan-output.md') {
		return true;
	}

	if (IGNORE_FILES.includes(fileName)) return true;
	return false;
}

/**
 * @param {string} filePath
 */
function isCodeFile(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	return CODE_EXTENSIONS.includes(ext);
}

/**
 * @param {string} filePath
 */
function getLanguageFromExtension(filePath) {
	const ext = path.extname(filePath).toLowerCase();

	/**@type {Record<string, string>} */
	const langMap = {
		'.js': 'javascript',
		'.jsx': 'jsx',
		'.ts': 'typescript',
		'.tsx': 'tsx',
		'.vue': 'vue',
		'.svelte': 'svelte',
		'.py': 'python',
		'.java': 'java',
		'.c': 'c',
		'.cpp': 'cpp',
		'.h': 'c',
		'.hpp': 'cpp',
		'.cs': 'csharp',
		'.php': 'php',
		'.rb': 'ruby',
		'.go': 'go',
		'.rs': 'rust',
		'.swift': 'swift',
		'.kt': 'kotlin',
		'.scala': 'scala',
		'.r': 'r',
		'.html': 'html',
		'.htm': 'html',
		'.css': 'css',
		'.scss': 'scss',
		'.sass': 'sass',
		'.less': 'less',
		'.xml': 'xml',
		'.json': 'json',
		'.yaml': 'yaml',
		'.yml': 'yaml',
		'.sql': 'sql',
		'.sh': 'bash',
		'.bat': 'batch',
		'.ps1': 'powershell',
		'.dockerfile': 'dockerfile',
		'.env': 'bash',
		'.gitignore': 'gitignore',
	};

	return langMap[ext] || 'text';
}

/**
 * @param {string} dirPath
 * @param {string} basePath
 * @param {string[]} customIgnorePaths
 * @returns {FileData[]}
 */
function scanDirectory(dirPath, basePath = dirPath, customIgnorePaths = []) {
	const results = [];

	try {
		const items = fs.readdirSync(dirPath);

		for (const item of items) {
			const fullPath = path.join(dirPath, item);
			const stat = fs.statSync(fullPath);

			// Kiểm tra xem đường dẫn có nằm trong danh sách ignore không
			const isIgnored = customIgnorePaths.some((ignorePath) => {
				const resolvedIgnorePath = path.resolve(ignorePath);
				const resolvedFullPath = path.resolve(fullPath);
				return (
					resolvedFullPath === resolvedIgnorePath ||
					resolvedFullPath.startsWith(resolvedIgnorePath + path.sep)
				);
			});

			if (isIgnored) {
				continue;
			}

			if (stat.isDirectory()) {
				if (!shouldIgnoreDir(item)) {
					results.push(...scanDirectory(fullPath, basePath, customIgnorePaths));
				}
			} else if (stat.isFile()) {
				if (!shouldIgnoreFile(item, fullPath) && isCodeFile(fullPath)) {
					results.push(
						new FileData({
							relativePath: path.relative(basePath, fullPath).replace(/\\/g, '/'),
							fullPath,
							language: getLanguageFromExtension(fullPath),
						}),
					);
				}
			}
		}
	} catch (error) {
		console.error(`Lỗi khi đọc thư mục ${dirPath}:`, error);
	}

	return results;
}

/**
 * @param {FileData[]} files
 * @param {string} targetDir
 */
function generateOutput(files, targetDir) {
	let content = `# Code Scan Results\n\n`;
	content += `Thời gian quét: ${new Date().toLocaleString('vi-VN')}\n`;
	content += `Tổng số file: ${files.length}\n`;
	content += `---\n\n`;

	for (const file of files) {
		try {
			const fileContent = fs.readFileSync(file.fullPath, 'utf8');
			content += `\n${file.relativePath}:\n`;
			content += `\`\`\`${file.language}\n`;
			content += fileContent;
			if (!fileContent.endsWith('\n')) {
				content += '\n';
			}
			content += `\`\`\`\n\n`;
		} catch (error) {
			console.error(`Lỗi khi đọc file ${file.fullPath}:`, error);
			content += `\n${file.relativePath}:\n`;
			content += `\`\`\`\n`;
			content += `// Lỗi khi đọc file: ${error}\n`;
			content += `\`\`\`\n\n`;
		}
	}

	const outputPath = path.join(targetDir, '.scan-output.md');
	fs.writeFileSync(outputPath, content, 'utf8');

	return outputPath;
}

/**
 * @param {string[]} args
 */
function parseArguments(args) {
	const result = {
		/**@type {string?} */
		targetDir: null,

		/**@type {string[]} */
		ignorePaths: [],
	};

	let i = 0;
	while (i < args.length) {
		if (args[i] === '--ignore' || args[i] === '-i') {
			i++;
			// Lấy tất cả các đường dẫn sau --ignore cho đến khi gặp tham số khác hoặc hết args
			while (i < args.length && !args[i].startsWith('-')) {
				// Chuẩn hóa đường dẫn tương đối dựa trên process.cwd()
				const ignorePath = path.resolve(process.cwd(), args[i]);
				result.ignorePaths.push(ignorePath);
				i++;
			}
		} else if (!result.targetDir) {
			// Chuẩn hóa đường dẫn target directory
			result.targetDir = path.resolve(process.cwd(), args[i]);
			i++;
		} else {
			i++;
		}
	}

	return result;
}

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log('Sử dụng: node tool.js <thư-mục-cần-quét> [--ignore <đường-dẫn-1> <đường-dẫn-2> ...]');
		console.log('');
		console.log('Ví dụ:');
		console.log('  node tool.js ./src');
		console.log('  node tool.js ./src --ignore src/temp src/cache');
		console.log('  node tool.js . -i tests docs/examples');
		console.log('');
		console.log(`Tool hiện tại: ${path.basename(__filename)} (sẽ được tự động bỏ qua)`);
		console.log('');
		console.log('Lưu ý: Các đường dẫn ignore là tương đối từ thư mục hiện tại (process.cwd)');
		process.exit(1);
	}

	const { targetDir, ignorePaths } = parseArguments(args);

	if (!targetDir) {
		console.error('Lỗi: Chưa chỉ định thư mục cần quét.');
		process.exit(1);
	}

	if (!fs.existsSync(targetDir)) {
		console.error(`Lỗi: Thư mục "${targetDir}" không tồn tại.`);
		process.exit(1);
	}

	if (!fs.statSync(targetDir).isDirectory()) {
		console.error(`Lỗi: "${targetDir}" không phải là thư mục.`);
		process.exit(1);
	}

	console.log(`Bắt đầu quét thư mục: ${targetDir}`);
	console.log(`Tool scanner: ${path.basename(__filename)} (sẽ được bỏ qua)`);

	if (ignorePaths.length > 0) {
		console.log('\nĐường dẫn ignore thủ công:');
		ignorePaths.forEach((p) => {
			console.log(`  - ${path.relative(process.cwd(), p)}`);
		});
	}

	const files = scanDirectory(targetDir, targetDir, ignorePaths);

	if (files.length === 0) {
		console.log('Không tìm thấy file code nào trong thư mục này (ngoại trừ tool scanner).');
		return;
	}

	console.log(`\nĐã tìm thấy ${files.length} file code:`);
	files.forEach((file) => {
		console.log(`  - ${file.relativePath}`);
	});

	console.log('\nĐang tạo file output...');
	const outputPath = generateOutput(files, targetDir);

	console.log(`\nFile output đã được tạo tại: ${outputPath}`);
	console.log(`Kích thước file: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
}

// Chạy tool
main();

/**
 * @param {object} params
 * @param {string} params.relativePath
 * @param {string} params.fullPath
 * @param {string} params.language
 */
function FileData({ relativePath, fullPath, language }) {
	this.relativePath = relativePath;
	this.fullPath = fullPath;
	this.language = language;
}
