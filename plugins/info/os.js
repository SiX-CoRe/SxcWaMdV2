import os from 'os';
import osu from 'node-os-utils';

const cpu = osu.cpu;
const drive = osu.drive;
const osUtil = osu.os;

const handler = async (m) => {
    try {
        const totalMem = os.totalmem() || 1;
        const freeMem = os.freemem() || 0;
        const usedMem = totalMem - freeMem;

        let driveInfo = { usedGb: 0, totalGb: 0 };
        try {
            if (drive && typeof drive.info === 'function') {
                driveInfo = await drive.info().catch(() => ({ usedGb: 0, totalGb: 0 }));
            }
        } catch (_) {}

        const cpus = os.cpus() || [];
        const cpuModel = (cpus[0]?.model) || 'Unknown CPU';
        const cpuCount = cpus.length || (typeof cpu.count === 'function' ? cpu.count() : 1);
        const uptimeOS = os.uptime() || 0;
        const runtime = process.uptime() || 0;

        const driveUsed = driveInfo?.usedGb || 0;
        const driveTotal = driveInfo?.totalGb || 1;

        const platformName = typeof osUtil.platform === 'function' ? osUtil.platform() : os.platform();

        const textos = `╭─[ ⚙️ *SYSTEM & SERVER INFO* ]
│ 🖥️ *OS*       : ${platformName} ${os.release()}
│ 🧠 *RAM*      : ${progressBar(usedMem, totalMem)} ${formatGB(usedMem)} / ${formatGB(totalMem)} GB
│ 💽 *Storage*  : ${progressBar(driveUsed, driveTotal)} ${driveUsed} / ${driveTotal} GB
│ 🔧 *CPU*      : ${cpuCount} Cores (${cpuModel})
│ ⏱️ *OS Uptime*: ${formatTime(uptimeOS)}
│ 📆 *Runtime*  : ${Math.floor(runtime / 3600)}h ${Math.floor((runtime % 3600) / 60)}m
╰────────────────────────`;

        const resultText = global.Func?.Styles ? global.Func.Styles(textos) : textos;
        await m.reply(resultText);
    } catch (e) {
        console.error('[OS Info Error]', e);
        m.reply("❌ Error: " + (e.message || e));
    }
};

handler.command = ['os', 'server'];
handler.help = ['os', 'server'];
handler.tags = ['info'];
handler.limit = 0; // Gratis

export default handler;

function formatGB(bytes) {
    if (!bytes || isNaN(bytes)) return '0.00';
    return (bytes / (1024 ** 3)).toFixed(2);
}

function progressBar(used, total, length = 10) {
    if (!total || isNaN(total) || total <= 0) return `[${'░'.repeat(length)}]`;
    const percent = Math.min(Math.max((used || 0) / total, 0), 1);
    const filled = Math.round(percent * length);
    return `[${'█'.repeat(filled)}${'░'.repeat(Math.max(length - filled, 0))}]`;
}

function formatTime(seconds) {
    const s = Math.floor(seconds || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
}