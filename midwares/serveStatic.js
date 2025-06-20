import express from 'express';
import fs from 'fs';
import path from 'path';

/**
 * - Create an express.static middleware corresponding to a relative path to the directory
 * - Create a sendFile middleware in case the path is a path to a file
 *
 * @param {string} pathname Relative path to the static folder/file to be public
 * @returns {express.RequestHandler} Express Middleware serves static files
 */
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
