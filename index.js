/*
* Gw LumnzTyz Ngasih Credits Thanks kepada yang bersangkutan & pembuat base ini
***/
process.env.NODE_NO_WARNINGS = '1';
process.removeAllListeners('warning');
process.emitWarning = () => {};

import './config.js';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import pino from "pino"

const logger = pino({
    level: "debug",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "HH:MM",
            ignore: "pid,hostname",
        },
    },
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, author, version } = require(join(__dirname, './package.json'));

const [major] = process.versions.node.split('.').map(Number);

if (major < 20) {
  logger.error("Node wajib 24!")
  process.exit(1);
};

logger.info(`🚀 Starting ${name} (v${version})...`)

var isRunning = false;

/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
function start(file) {
  if (isRunning) return;
  isRunning = true;

  let args = [join(__dirname, file), ...process.argv.slice(2)];

  setupMaster({ exec: args[0], args: args.slice(1) });
  let p = fork();

  p.on('exit', (_, code) => {
    isRunning = false;
    logger.warn(`Worker process exited (code: ${code}). Auto-restarting in 2 seconds...`);
    setTimeout(() => {
      start(file);
    }, 2000);
  });
}

start('main.js');