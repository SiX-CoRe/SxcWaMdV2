import fs from 'fs'
import { fileURLToPath } from 'url'
import chalk from "chalk"

const hairColors = [
  "#C0C0C0", "#A9A9A9",
  "#064420", "#16A085", "#013220",
  "#E0FFFF", "#B0E0E6"
]

function pickRandomHairColor() {
  const randomHex = hairColors[Math.floor(Math.random() * hairColors.length)];
  return randomHex;
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

export default async function printInfo(m, conn = { user: {} }) {
    if (!m || !m.sender || !m.chat || !m.mtype) return;
    if (m.chat.endsWith('@newsletter') || m.chat === 'status@broadcast') return;

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender;
    const chat = conn.decodeJid ? conn.decodeJid(m.chat) : m.chat;
    const user = (conn.getName ? await conn.getName(sender) : '') || m.pushName || sender.split('@')[0] || "User";

    const pesan = m.text ? m.text : (m.mtype || "");
    const time = new Date().toTimeString().slice(0, 5);

    let colorh = pickRandomHairColor();
    const reset = "\x1b[0m";
    const { r, g, b } = hexToRgb(colorh);
    const colorANSI = `\x1b[38;2;${r};${g};${b}m`;

    const chatContext = m.isGroup ? "Group" : "Private";
    console.log(`[${time}] [${chatContext}] ${colorANSI}${user}${reset}: ${pesan}`);
}

const __filename = fileURLToPath(import.meta.url)
fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename)
  console.log("\x1b[91mUpdate 'lib/print.js'\x1b[0m")
})