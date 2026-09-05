import os from "os";
import process from "process";

const handler = async (m, { conn }) => {
    const start = process.hrtime.bigint();

    const sent = await m.reply("⏳ *Mengukur latensi server...*");

    const end = process.hrtime.bigint();
    const latency = Number(end - start) / 1e6;

    const uptime = process.uptime();
    const formatUptime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        return `${h}h ${m}m ${sec}s`;
    };

    const used = process.memoryUsage().rss / 1024 / 1024;
    const total = os.totalmem() / 1024 / 1024;

    const text = `
🏓 *P O N G !*

⚡ *Respon Speed :* ${latency.toFixed(2)} ms
🧠 *Penggunaan RAM:* ${used.toFixed(1)} MB / ${total.toFixed(0)} MB
⏱️ *Uptime Bot   :* ${formatUptime(uptime)}
📡 *Status Server:* Online & Normal
`.trim();

    const finalText = global.Func?.Styles ? global.Func.Styles(text) : text;

    await conn.sendMessage(
        m.chat,
        { text: finalText },
        { quoted: sent }
    );
};

handler.command = ["ping", "p"];
handler.help = ["ping"];
handler.tags = ["info"];

export default handler;