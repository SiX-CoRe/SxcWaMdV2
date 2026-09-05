import util from 'util';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`📝 *EVAL JAVASCRIPT*

Contoh:
${usedPrefix + command} 1 + 1
${usedPrefix + command} m.sender
${usedPrefix + command} m.chat
${usedPrefix + command} const x = 10; x * 2
${usedPrefix + command} await conn.sendMessage(m.chat, { text: "Halo" })
`);
    }

    await m.react("⏳");

    const code = text.trim();
    const consoleOutput = [];
    const originalConsoleLog = console.log;

    console.log = (...args) => {
        const str = args.map(arg =>
            typeof arg === "object" && arg !== null
                ? util.inspect(arg, { depth: 4, colors: false })
                : String(arg)
        ).join(" ");

        consoleOutput.push(str);
        originalConsoleLog(...args);
    };

    try {
        const ctx = {
            m,
            conn,
            quoted: m.quoted || null,
            console,
            process,
            Buffer,
            util,
            require: global.require || undefined,
            global
        };

        let wrappedCode;

        const isExpression =
            !code.includes("\n") &&
            !/[;{}]/.test(code) &&
            !/^(const|let|var|function|class|async|await|for|if|switch|try|while|return|import|export)/.test(code);

        if (isExpression) {
            wrappedCode = `return (${code});`;
        } else {
            wrappedCode = code;
        }

        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

        const asyncFunc = new AsyncFunction(
            "ctx",
            `
const {
    m,
    conn,
    quoted,
    console,
    process,
    Buffer,
    util,
    require,
    global
} = ctx;

const jid = m.chat;
const from = m.chat;
const sender = m.sender;
const me = conn?.user?.id || conn?.user?.jid || null;

${wrappedCode}
`
        );

        const result = await asyncFunc(ctx);

        console.log = originalConsoleLog;

        let output = "";

        if (consoleOutput.length) {
            output += `📜 Console:\n${consoleOutput.join("\n")}\n\n`;
        }

        if (result === undefined) {
            output += "undefined";
        } else if (typeof result === "object") {
            output += util.inspect(result, {
                depth: 5,
                colors: false
            });
        } else {
            output += String(result);
        }

        if (output.length > 4000)
            output = output.slice(0, 4000) + "\n... (truncated)";

        await m.reply("```js\n" + output + "\n```");
        await m.react("✅");

    } catch (err) {
        console.log = originalConsoleLog;

        let error = err?.stack || err?.message || String(err);

        if (error.length > 4000)
            error = error.slice(0, 4000) + "\n... (truncated)";

        await m.reply(`❌ *Error:*
\`\`\`js
${error}
\`\`\``);

        await m.react("❌");
    }
};

handler.help = ["> <code>", "eval <code>"];
handler.tags = ["owner"];
handler.command = /^(>|eval|ev|=>|!!)$/i;
handler.rowner = true;

export default handler;