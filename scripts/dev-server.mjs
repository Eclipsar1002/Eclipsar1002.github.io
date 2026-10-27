import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { dynamicEnv, projectEnv } from './env.mjs';

const dynamic = process.argv.includes('--dynamic');
const env = dynamic ? dynamicEnv() : projectEnv();
const host = env.HOST || '0.0.0.0';
const port = env.PORT || '4321';

const child = spawn(
	process.execPath,
	[join('node_modules', 'astro', 'bin', 'astro.mjs'), 'dev', '--host', host, '--port', port],
	{
		stdio: 'inherit',
		shell: false,
		env,
	},
);

child.on('exit', (code) => {
	process.exit(code ?? 0);
});

child.on('error', (error) => {
	console.error(error.message);
	process.exit(1);
});
