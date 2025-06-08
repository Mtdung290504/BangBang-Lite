/**
 * Initializes a socket.io client connection with error handling and timeout.
 */
export function getSocketConnection(): Promise<import('socket.io-client').Socket>;

/**
 * - Initializes and returns a connected socket. If the connection fails, returns null.
 * - Note: This function maintains a single socket instance and only creates a new one if none exists.
 */
export function getConnectedSocket(): Promise<import('socket.io-client').Socket | null>;
