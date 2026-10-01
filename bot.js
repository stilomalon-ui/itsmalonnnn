const mineflayer = require('@wp2508/mineflayer');

let reconnecting = false;

function createBot() {
    console.log('[NPC] Intentando conectar al servidor...');

    const bot = mineflayer.createBot({
        host: 'itsmalon23.aternos.me',
        port: 27607,
        username: 'maloncin23',

        // Minecraft Java 26.3
        version: '26.3',

        // Si tu servidor Aternos es NO-PREMIUM:
        auth: 'offline'
    });

    // =========================================================
    // CONEXIÓN
    // =========================================================

    bot.once('login', () => {
        console.log('[NPC] Conexión establecida con el servidor.');
    });

    bot.once('spawn', () => {
        console.log('[NPC] El bot ha aparecido correctamente en el mapa.');
    });

    // =========================================================
    // MENSAJES DEL SERVIDOR
    // =========================================================

    bot.on('message', (message) => {
        console.log(`[CHAT] ${message.toString()}`);
    });

    // =========================================================
    // RUTINA ANTI-AFK
    // Cada 45 segundos
    // =========================================================

    const antiAfkInterval = setInterval(async () => {

        if (!bot.entity) {
            return;
        }

        try {

            console.log('[NPC] Ejecutando rutina anti-AFK...');

            // -------------------------------------------------
            // BUSCAR COFRE
            // -------------------------------------------------

            const chestId = bot.registry.blocksByName.chest?.id;

            if (chestId !== undefined) {

                const chestBlock = bot.findBlock({
                    matching: chestId,
                    maxDistance: 5
                });

                if (chestBlock) {

                    console.log('[NPC] Cofre encontrado. Intentando abrir...');

                    try {

                        const chest = await bot.openChest(chestBlock);

                        console.log('[NPC] Cofre abierto.');

                        // Mantenerlo abierto 2 segundos
                        await new Promise(resolve =>
                            setTimeout(resolve, 2000)
                        );

                        chest.close();

                        console.log('[NPC] Cofre cerrado.');

                    } catch (chestError) {

                        console.log(
                            `[NPC] No se pudo abrir el cofre: ${chestError.message}`
                        );

                    }

                } else {

                    console.log(
                        '[NPC] No se encontró ningún cofre a menos de 5 bloques.'
                    );

                }
            }

            // -------------------------------------------------
            // SALTO ANTI-AFK
            // -------------------------------------------------

            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );

            if (bot.entity) {

                bot.setControlState('jump', true);

                setTimeout(() => {

                    if (bot.entity) {
                        bot.setControlState('jump', false);
                    }

                }, 500);

                console.log('[NPC] Salto anti-AFK realizado.');

            }

        } catch (error) {

            console.log(
                `[NPC] Error en la rutina anti-AFK: ${error.message}`
            );

        }

    }, 45000);

    // =========================================================
    // DESCONEXIÓN
    // =========================================================

    bot.on('end', (reason) => {

        console.log(
            `[NPC] Conexión finalizada: ${reason || 'sin motivo indicado'}`
        );

        clearInterval(antiAfkInterval);

        if (reconnecting) {
            return;
        }

        reconnecting = true;

        console.log(
            '[NPC] Intentando reconectar en 25 segundos...'
        );

        setTimeout(() => {

            reconnecting = false;

            createBot();

        }, 25000);

    });

    // =========================================================
    // KICK
    // =========================================================

    bot.on('kicked', (reason) => {

        console.log(
            `[NPC] El servidor expulsó al bot: ${reason}`
        );

    });

    // =========================================================
    // ERROR
    // =========================================================

    bot.on('error', (error) => {

        console.log(
            `[NPC] Error de conexión: ${error.message}`
        );

    });
}

// =============================================================
// INICIAR BOT
// =============================================================

createBot();
