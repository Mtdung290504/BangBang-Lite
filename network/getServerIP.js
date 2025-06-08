import os from 'os';

/**@type {import('./@types')['getServerIP']} */
export default function getServerIP() {
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
