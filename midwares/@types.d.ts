import express from 'express';

/**
 * - Tạo một middleware express.static tương ứng với một đường dẫn tương đối đến thư mục
 * - Tạo một middleware sendFile trong trường hợp đường dẫn là đường dẫn đến file
 * @param pathname Đường dẫn tương đối tới thư mục tĩnh cần public
 * @returns Middleware Express phục vụ static file
 */
export function createStaticMiddleware(pathname: string): express.RequestHandler;
