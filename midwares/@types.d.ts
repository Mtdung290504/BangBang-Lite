import express from 'express';

/**
 * - Create an express.static middleware corresponding to a relative path to the directory
 * - Create a sendFile middleware in case the path is a path to a file
 * @param pathname Relative path to the static folder/file to be public
 * @returns Express Middleware serves static files
 */
export function createStaticMiddleware(pathname: string): express.RequestHandler;
