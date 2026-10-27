import { existsSync, readFileSync } from 'node:fs';

export function readEnvFile(path = '.env') {
	if (!existsSync(path)) return {};

	return Object.fromEntries(
		readFileSync(path, 'utf8')
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#') && line.includes('='))
			.map((line) => {
				const index = line.indexOf('=');
				const key = line.slice(0, index).trim();
				const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
				return [key, value];
			}),
	);
}

export function projectEnv(defaults = {}) {
	const envFilePath = process.env.ATLAS_ENV_FILE || '.env';

	return {
		...defaults,
		...process.env,
		...readEnvFile(envFilePath),
	};
}

export function dynamicEnv() {
	return projectEnv({ ATLAS_DYNAMIC: 'true' });
}
