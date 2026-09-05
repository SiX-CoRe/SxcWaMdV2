import { exec } from "child_process";

let handler = async (m, { conn, text, command }) => {
  try {
    const finalCmd = command.trimStart() + " " + text.trimEnd();

    exec(finalCmd, { timeout: 60000 }, (err, stdout, stderr) => {
      try {
        if (err) return m.reply(`❌ *Error:* ${err.message}`);
        if (stderr) return m.reply(`⚠️ *Stderr:* ${stderr}`);
        if (!stdout) return m.reply("✅ Perintah berhasil, tapi tanpa output.");

        m.reply(`📤 output:\n\n\`\`\`${stdout}\`\`\``);
      } catch (e) {
        m.reply(`❌ Error:\n${e.message}`);
      }
    });

  } catch (e) {
    m.reply(`❌ Error:\n${e.message}`);
  }
};

handler.help = ["$ <command>"];
handler.tags = ["owner"];
handler.customPrefix = /^[$]\s/;
handler.command = new RegExp();
handler.rowner = true;

export default handler;
