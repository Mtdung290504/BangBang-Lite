import os from 'os';

/**
 * Utility function that returns the server's own Wifi IP
 *
 * @returns {string | undefined}
 */
export default function getWifiIP() {
	const interfaces = os.networkInterfaces();
	const wifiInterface = interfaces['Wi-Fi'];

	if (wifiInterface) {
		for (const details of wifiInterface) {
			if (details.family === 'IPv4' && !details.internal) {
				return details.address;
			}
		}
	}

	return undefined;
}
