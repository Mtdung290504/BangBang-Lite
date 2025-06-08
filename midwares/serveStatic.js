import express from 'express';
import fs from 'fs';
import path from 'path';

/** @type {import('./@types')['createStaticMiddleware']} */
export default function serveStatic(pathname) {
	const fullPath = path.resolve(pathname);

	if (!fs.existsSync(fullPath)) {
		throw new Error('> [Server.serveStatic] Path does not exist: ' + fullPath);
	}

	const stat = fs.statSync(fullPath);

	if (stat.isDirectory()) {
		return express.static(fullPath);
	}

	// Return middleware to serve the file manually
	if (stat.isFile()) {
		return (req, res, next) => {
			if (req.path === '/' || req.path === '/' + path.basename(fullPath)) {
				res.sendFile(fullPath);
			} else {
				next();
			}
		};
	}

	throw new Error('> [Server.serveStatic] Path is neither file nor directory: ' + fullPath);
}
