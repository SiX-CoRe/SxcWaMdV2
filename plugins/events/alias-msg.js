const {
    generateWAMessage,
    areJidsSameUser,
    proto
} = await import("@adiwajshing/baileys");

let handler = (m) => m;
handler.before = async (m, {
    conn
}) => {
    conn.sendAliasMessage = async (jid, mess = {}, alias = {}, quoted = null) => {
        function check(arr) {
            if (!Array.isArray(arr)) {
                return false;
            }
            if (!arr.length) {
                return false;
            }
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                if (typeof item !== "object" || item === null || typeof item === "function") {
                    return false;
                }
                if (!Object.prototype.hasOwnProperty.call(item, "alias")) {
                    return false;
                }
                if (!Array.isArray(item.alias) && typeof item.alias !== "string") {
                    return false;
                }
                if (
                    Object.prototype.hasOwnProperty.call(item, "response") &&
                    typeof item.response !== "string"
                ) {
                    return false;
                }
                if (
                    Object.prototype.hasOwnProperty.call(item, "eval") &&
                    typeof item.eval !== "string"
                ) {
                    return false;
                }
            }
            return true;
        }
        if (!check(alias)) return "Alias format is not valid!";
        let message = await conn.sendMessage(jid, mess, {
            quoted: quoted
        });
        if (typeof conn.alias[jid] === "undefined")
            conn.alias[jid] = {};
        conn.alias[jid][message.key.id] = {
            chat: jid,
            id: message.key.id,
            alias,
        };
        return message;
    };
    conn.sendInputMessage = async (
        jid,
        mess = {},
        target = "all",
        timeout = 60000,
        quoted = null,
    ) => {
        let time = Date.now();
        let message = await conn.sendMessage(jid, mess, {
            quoted: quoted
        });
        if (typeof conn.input[jid] === "undefined")
            conn.input[jid] = {};
        conn.input[jid][message.key.id] = {
            chat: jid,
            id: message.key.id,
            target,
        };

        while (
            Date.now() - time < timeout &&
            !conn.input[jid][message.key.id]?.hasOwnProperty("input")
        )
            await conn.delay(500);

        return conn.input[jid]?.[message.key.id]?.input;
    };

    if (typeof conn.alias === "undefined")
        conn.alias = {};
    if (typeof conn.input === "undefined")
        conn.input = {};

    if (m.quoted) {
        const quotedId = m.quoted.id;
        if (
            conn.input[m.chat]?.[quotedId]?.target === "all" ||
            conn.input[m.chat]?.[quotedId]?.target === m.sender
        ) {
            conn.input[m.chat][quotedId].input = m.text;
        }
        if (conn.alias.hasOwnProperty(m.chat)) {
            if (conn.alias[m.chat].hasOwnProperty(quotedId)) {
                const aliasList = conn.alias[m.chat][quotedId].alias || [];
                for (const aliasObj of aliasList) {
                    if (!aliasObj || typeof aliasObj === 'function') continue;
                    if (
                        Array.isArray(aliasObj.alias) &&
                        !aliasObj.alias
                        .map((v) => typeof v === 'string' ? v.toLowerCase() : '')
                        .includes(m.text?.toLowerCase())
                    )
                        continue;
                    else if (typeof aliasObj.alias === 'string' && aliasObj.alias.toLowerCase() !== m.text?.toLowerCase())
                        continue;
                    else {
                        try {
                            if (aliasObj.response)
                                await emit(conn, m, aliasObj.response);
                            if (aliasObj.eval) await eval(aliasObj.eval);
                        } catch (e) {
                            console.error('[Alias Msg Error]', e);
                        }
                    }
                }
            }
        }
    }
};

async function emit(conn, m, text, chatUpdate) {
    if (!conn) return;
    let messages = await generateWAMessage(m.key.remoteJid, {
        text: text,
        mentions: m.mentionedJid
    }, {
        userJid: conn.user?.id,
        quoted: m.quoted && m.quoted.fakeObj
    });
    messages.key.fromMe = areJidsSameUser(m.sender, conn.user?.id);
    messages.key.id = m.key.id;
    messages.pushName = m.pushName;
    if (m.isGroup) messages.participant = m.sender;
    let msg = {
        ...chatUpdate,
        messages: [proto.WebMessageInfo.create(messages)],
        type: 'append'
    };
    conn.ev.emit('messages.upsert', msg);
};

export default handler