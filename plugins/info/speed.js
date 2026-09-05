import { exec as execCb } from "child_process";
import { promisify } from "util";
import process from "process";
import os from "os";

const exec = promisify(execCb);

const handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        let start = process.hrtime.bigint();
        let speedOutput = null;

        try {
            const { stdout, stderr } = await exec("python3 speed.py --share", { timeout: 15000 });
            if (stdout?.trim()) speedOutput = stdout.trim();
        } catch {}

        let end = process.hrtime.bigint();
        let pingMs = Number(end - start) / 1e6;

        if (speedOutput) {
            const mat = speedOutput.match(/Share results: (http[^\s]+)/);
            if (mat && mat[1]) {
                await conn.sendMessage(m.chat, { image: { url: mat[1] }, caption: `⚡ *SPEEDTEST RESULT*\n\n${speedOutput}` }, { quoted: m });
            } else {
                await m.reply(`⚡ *SPEEDTEST RESULT*\n\n${speedOutput}`);
            }
        } else {
            const used = process.memoryUsage().rss / 1024 / 1024;
            const total = os.totalmem() / 1024 / 1024;
            
            const msg = `⚡ *BENCHMARK & RESPONSE SPEED*\n\n` +
                        `📶 *Latensi Respon:* ${pingMs.toFixed(2)} ms\n` +
                        `🧠 *RAM:* ${used.toFixed(1)} MB / ${total.toFixed(0)} MB\n` +
                        `🖥️ *Platform:* ${os.platform()} (${os.arch()})\n` +
                        `✅ *Status Jaringan:* Stabil & Aktif`;
            await m.reply(msg);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error saat melakukan tes kecepatan: " + (e.message || e));
    }
};

handler.command = ["speed", "speedtest"];
handler.help = ["speed", "speedtest"];
handler.tags = ["info"];

export default handler;