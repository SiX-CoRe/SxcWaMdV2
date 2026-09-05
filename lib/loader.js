import path from "node:path";
import fs from "node:fs";
import { promisify } from "node:util";
import chokidar from "chokidar";
import chalk from "chalk";
import { createRequire } from "node:module";
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

const require = createRequire(import.meta.url);

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class PluginLoader {
  constructor(directory) {
    this.directory = directory;
    this.plugins = {};
  }

  async scandir(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(
      subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? this.scandir(res) : res;
      })
    );
    return files.flat();
  }

  async load() {
    const files = await this.scandir(this.directory);
    for (const filename of files) {
      const ext = path.extname(filename);
      const relativePath = path.relative(process.cwd(), filename);

      try {
        if (ext === ".mjs" || ext === ".js") {
          
          const mod = await import(`file://${filename}?update=${Date.now()}`);
          this.plugins[relativePath] = mod.default ?? mod;
        } else if (ext === ".cjs") {
          
          delete require.cache[require.resolve(filename)];
          this.plugins[relativePath] = require(filename);
        }
      } catch (e) {
        logger.error(`Gagal memuat [ ${relativePath} ]: ` + e);
        delete this.plugins[relativePath];
      }
    }
  }

  async watch() {
    const watcher = chokidar.watch(path.resolve(this.directory), {
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on("add", async (filename) => {
        const ext = path.extname(filename);
        const relativePath = path.relative(process.cwd(), filename);

        if (![".js", ".mjs", ".cjs"].includes(ext)) return;

        try {
          if (ext === ".cjs") {
            delete require.cache[require.resolve(filename)];
            this.plugins[relativePath] = require(filename);
          } else {
            const mod = await import(`file://${filename}?update=${Date.now()}`);
            this.plugins[relativePath] = mod.default ?? mod;
          }
          logger.info(`Plugin baru terdeteksi: ${filename}`);
          await this.load();
        } catch (e) {
          logger.error(`Gagal memuat [ ${relativePath} ]: ` + e);
        }
      })
      .on("change", async (filename) => {
        const ext = path.extname(filename);
        if (![".js", ".mjs", ".cjs"].includes(ext)) return;

        const relativePath = path.relative(process.cwd(), filename);

        try {
          if (ext === ".cjs") {
            delete require.cache[require.resolve(filename)];
            this.plugins[relativePath] = require(filename);
          } else {
            const mod = await import(`file://${filename}?update=${Date.now()}`);
            this.plugins[relativePath] = mod.default ?? mod;
          }
          logger.info(`File diubah: ${filename}`);
          await this.load();
        } catch (e) {
          logger.error(`Gagal memperbarui [ ${relativePath} ]: ` + e);
        }
      })
      .on("unlink", (filename) => {
        const relativePath = path.relative(process.cwd(), filename);
        logger.info(`File dihapus: ${filename}`);
        delete this.plugins[relativePath];
      });
  }
}

export default PluginLoader;