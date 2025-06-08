import express from 'express';
import fs from 'fs';
import path from 'path';

/** @type {import('./@types')['createStaticMiddleware']} */
const serveStatic = (pathname) => {
	const fullPath = path.resolve(pathname);

	if (!fs.existsSync(fullPath)) {
		throw new Error('Path does not exist: ' + fullPath);
	}

	const stat = fs.statSync(fullPath);

	if (stat.isDirectory()) {
		return express.static(fullPath);
	}

	if (stat.isFile()) {
		// Trả về middleware xử lý thủ công
		return (req, res, next) => {
			if (req.path === '/' || req.path === '/' + path.basename(fullPath)) {
				res.sendFile(fullPath);
			} else {
				next();
			}
		};
	}

	throw new Error('Path is neither file nor directory: ' + fullPath);
};

export default serveStatic;
