export default async function handler(m, { conn, args }) {
   const ak = args[0] || "";
   const oota = ["--off", "--on"];

   if (!oota.includes(ak)) return m.reply("⚠️Mau --on atau --off");

   switch (ak) {
       case "--off": {
            db.data.settings[conn.user.jid].self = false;
            await m.reply("❌ Udah Di Matiin Self Nya!");
       };
       break;
       case "--on": {
             db.data.settings[conn.user.jid].self = true;
             await m.reply("✅ Udah Di Self Bot Nya!");
        };
        break;
    };
};

handler.command = handler.help = ["self"];
handler.tags = ["owner"];
handler.owner = true;
