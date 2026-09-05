/**
 * Plugin Restart Bot
 * Owner Only
 * Compatible: NAO-MD / KASHIWADA-BOTWA
 * Gw LumnzTyz Ngasih Credits Thanks
 */

let handler = async (m, { conn }) => {
  await m.reply("♻️ *Restarting bot...*\nTunggu beberapa detik ⏳");

  setTimeout(() => {
    process.exit(0);
  }, 1500);
};

handler.help = ["restart"];
handler.tags = ["owner"];
handler.command = /^(restart|reboot)$/i;
handler.owner = true;

export default handler;