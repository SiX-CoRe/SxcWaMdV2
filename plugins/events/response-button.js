let handler = (m) => m;
handler.before = async (m, {
    conn
}) => {
    try {
        if (m.mtype === "interactiveResponseMessage") {
            let msg = m.message?.[m.mtype] || m.msg
            if (msg?.nativeFlowResponseMessage && !m.isBot) {
                let id = null
                try {
                    let parsed = JSON.parse(msg.nativeFlowResponseMessage.paramsJson || '{}')
                    id = parsed?.id
                } catch (errJson) {}
                
                if (id) {
                    let emit_msg = {
                        key: {
                            ...m.key
                        }, 
                        message: {
                            extendedTextMessage: {
                                text: id
                            }
                        },
                        pushName: m.pushName,
                        messageTimestamp: m.messageTimestamp || Date.now()
                    }
                    return conn.ev.emit("messages.upsert", {
                        messages: [emit_msg],
                        type: "notify"
                    })
                }
            }
        } else if (m.mtype === 'buttonsResponseMessage') {
            let msg = m.message?.[m.mtype] || m.msg;

            if (msg?.selectedButtonId && !m.isBot) {
                let emit_msg = {
                    key: {
                        ...m.key
                    }, 
                    message: {
                        extendedTextMessage: {
                            text: msg.selectedButtonId
                        }
                    },
                    pushName: m.pushName,
                    messageTimestamp: m.messageTimestamp || Date.now()
                };

                return conn.ev.emit("messages.upsert", {
                    messages: [emit_msg],
                    type: "notify"
                });
            }
        } else if (m.mtype === 'templateButtonReplyMessage') {
            let msg = m.message?.[m.mtype] || m.msg;

            if (msg?.selectedId && !m.isBot) {
                let emit_msg = {
                    key: {
                        ...m.key
                    }, 
                    message: {
                        extendedTextMessage: {
                            text: msg.selectedId
                        }
                    },
                    pushName: m.pushName,
                    messageTimestamp: m.messageTimestamp || Date.now()
                };

                return conn.ev.emit("messages.upsert", {
                    messages: [emit_msg],
                    type: "notify"
                });
            }
        }
    } catch (e) {
        console.error('[Response Button Error]', e);
    }
}

export default handler;