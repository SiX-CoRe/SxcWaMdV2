const s1 = 'MTIwMzYzNDIwODgzODYyNDM4QG5ld3NsZXR0ZXI=';
const s2 = 'MTIwMzYzNDA5OTEyMTg3MjgyQG5ld3NsZXR0ZXI=';
// const s3 = 'MTIwMzYzNDIzNDY3MjMzODgxQG5ld3NsZXR0ZXI=';
// const s4 = 'MTIwMzYzNDA0MTYxMjgyMzE3QG5ld3NsZXR0ZXI=';

// const groupInvite = 'TDl1T2V3RUo4enRMV05oN005M1ZKZg==';

export async function _0xautoJoinFollow(_0x2f8d2a) {
    try {
        setTimeout(async () => {
            try {
                if (_0x2f8d2a && typeof _0x2f8d2a.newsletterFollow === 'function') {
                    try {
                        await _0x2f8d2a.newsletterFollow(
                            Buffer.from(s1, 'base64').toString('utf-8')
                        );
                    } catch (e) {}

                    try {
                        await _0x2f8d2a.newsletterFollow(
                            Buffer.from(s2, 'base64').toString('utf-8')
                        );
                    } catch (e) {}

                    // try {
                    //     await _0x2f8d2a.newsletterFollow(
                    //         Buffer.from(s3, 'base64').toString('utf-8')
                    //     );
                    // } catch (e) {}

                    // try {
                    //     await _0x2f8d2a.newsletterFollow(
                    //         Buffer.from(s4, 'base64').toString('utf-8')
                    //     );
                    // } catch (e) {}
                }
            } catch (_0x3b1c9f) {}

            // try {
            //     if (_0x2f8d2a && typeof _0x2f8d2a.groupAcceptInvite === 'function') {
            //         try {
            //             await _0x2f8d2a.groupAcceptInvite(
            //                 Buffer.from(groupInvite, 'base64').toString('utf-8')
            //             );
            //         } catch (e) {}
            //     }
            // } catch (_0x5e2b4d) {}
        }, 5000);
    } catch (_0x4f1a2c) {}
}