const { create, Client, decryptMedia } = require('@open-wa/wa-automate');
const moment = require('moment-timezone');

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Xaakla Bot Running...');
})

app.listen(port, () => {
    create(options)
        .then((client) => start(client))
        .catch((err) => new Error(err));
    console.log(`Example app listening at http://localhost:${port}`);
})

const start = (client = new Client()) => {
    client.onMessage((message) => {
        msgHandler2(client, message);
    });

    // client.onAnyMessage((fn) => console.log('onAnyMessage', fn.fromMe, fn.type))
};

const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();
}

async function msgHandler2(client, message) {
    try {
        // console.log('message', message);

        const { from, t, type } = message;

        if (type === 'chat') {
            let { body } = message;
            console.log(body)
            if (!isACommand(body) && !body.includes('me floda')) return console.error('There are no command to execute');

            handleChatCommands(client, message, false);

            return console.log('chat');
        }
        if (type === 'image') {
            // console.log(message.caption)

            const { caption } = message;

            if (!caption) return console.error('There are no caption')

            if (!isACommand(caption)) return console.error('There are no command to execute');

            if (hasParameters(caption)) {
                const { status, parameters } = getCommandParameters(caption);

                if (!status) console.error('something went wrong while trying to catch the parameters', parameters)

                console.log(status, parameters)

                handleImageCommands(client, message, true, parameters);
            } else {
                handleImageCommands(client, message, false);
            }


            //

            // if (!status) console.log('deu false', parameters)

            // handleImageCommands(message);




            return console.log('image');
        }
        if (type === 'video') {
            return console.log('video');
        }
        if (type === 'sticker') {
            return console.log('sticker');
        }
    } catch (err) {
        console.error("Erro no msgHandler#2", err);
    }
}

async function msgHandler(client, message) {
    console.log('entrou na fun????o');
    try {
        console.log('entrou no try');
        const uaOverride = "WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
        const { isMedia, quotedMsg, mimetype, from, t } = message;
        let { body, caption } = message;
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image';

        if (isMedia) {
            if (caption === '/sticker') {
                if (isMedia || isQuotedImage) {
                    console.log('entrou no if');
                    const encryptMedia = isQuotedImage ? quotedMsg : message;
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype;
                    const mediaData = await decryptMedia(encryptMedia, uaOverride);
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`;

                    client.sendImageAsSticker(from, imageBase64, {keepScale: true}).then(() => {
                        client.reply(from, 'Here\'s your sticker')
                        console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                    });
                }
            }
            if (caption.includes('/sticker') && caption.includes('"')) {
                if (isMedia || isQuotedImage) {
                    console.log('entrou no if');
                    const encryptMedia = isQuotedImage ? quotedMsg : message;
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype;
                    const mediaData = await decryptMedia(encryptMedia, uaOverride);
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`;
                    let response = await handleStickerCommand(caption);

                    if (!response.status) {
                        console.error('Erro ao processar comando...');
                        return client.reply(from, 'Erro ao processar comando.');
                    }

                    client.sendImageAsSticker(
                        from,
                        imageBase64,
                        {
                            author: response.author,
                            pack: response.packName,
                            keepScale: true
                        }
                    )
                        .then(() => {
                            client.reply(from, 'Here\'s your sticker')
                            console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                        }).catch(err => console.log(err));
                } else {
                    console.log('deu erro');
                }
            }
        } else {
            switch (body) {
                case 'me floda':
                    for (let i = 0; i <= 100; i++)
                        client.sendText(from, 'flodando');
                    break;

                default:
                    console.log('caiu no default');
                    break;
            }
        }

    } catch (err) {
        console.error("Erro no msgHandler#2", err);
    }
}

function handleImageCommands(client, message, hasParameters, parameters = []) {
    let { caption } = message;

    let identifier = hasParameters ? getCommand(caption) : caption;
    if(hasParameters && identifier === undefined) return console.error('caption is undefined');

    console.log('identifier', identifier)

    switch (identifier) {
        case '/sticker':
            if (hasParameters) {
                handleStickerCommands(client, message, parameters);
            } else handleStickerCommands(client, message);
            break;

        default:
            console.error('This command doesn\'t exists', identifier);
            break;
    }
}

async function handleChatCommands(client, message, hasParameters, parameters = []) {
    let { body, from } = message;

    let identifier = hasParameters ? getCommand(body) : body;
    if(hasParameters && identifier === undefined) return console.error('body is undefined');

    console.log(identifier);

    if (body.includes('me floda')) {
        let firstDoubleQuote, lastDoubleQuote, times;

        firstDoubleQuote = body.indexOf('m');
        lastDoubleQuote = body.indexOf('a', 1);
        rest = body.substring(lastDoubleQuote + 1).trim()

        firstDoubleQuote = rest.indexOf('v');
        lastDoubleQuote = rest.indexOf('s');
        console.log(firstDoubleQuote, lastDoubleQuote)
        times = rest.substring(0, firstDoubleQuote).trim()

        console.log('times', times);
        console.log('rest', rest);

        parseInt(times);

        if (times >= 500) {
            await client.sendText(from, 'vai se fuder ne');
            await client.sendText(from, `${times} vezes?`);
            await client.sendText(from, 'viro bagun??a?');
            await client.sendText(from, 'viro festa??');
            await client.sendText(from, 'quando o preto n tem o q fazer d?? nisso');
            await client.sendText(from, 'vo executa nao');
            await client.sendText(from, 'pau no cu');

            return
        }

        for (let i = 1; i <= times; i++)
            await client.sendText(from, 'flodando');
        // console.log('substring', body.substring(lastDoubleQuote + 1).trim());
    }

    switch (body) {
        case '/spam':
            await client.sendText(from, 'ovo manda');
            client.ghostForward('556293423942@c.us',
                ['false_556292045332@c.us_10F9EAEFF10D1AA7D315F0C8318356F7'], false)
                .then((response) => console.log('then => ', response))
                .catch((error) => console.error('catch => ', error));
            await client.sendText(from, '?? mandei');
            break;

        case '/battery':
            client.getBatteryLevel()
                .then((response) => client.sendText(from, `Minha bateria est?? ${response}%`))
                .catch((error) => console.error('catch => ', error));
            break;
        default:
            break;
    }
}

function isACommand(string) {
    if (string.trim().startsWith('/')) return true;
    else return false;
}

function hasParameters(command) {
    let firstEmptySpace = command.indexOf(' ');

    if (firstEmptySpace === -1) return false;

    return true;
}

function getCommand(command) {
    let firstEmptySpace = command.indexOf(' ');
    if (firstEmptySpace === -1) return undefined;
    return command.slice(0, firstEmptySpace).trim();
}

function getCommandParameters(command) {
    let firstEmptySpace = command.indexOf(' ');
    if (firstEmptySpace === -1) return { status: false, parameters: [] };
    command = command.slice(firstEmptySpace).trim();
    console.log('agora sim?', command)

    /**
     * Cria duas variaveis que contem o inicio e o final do primeiro par??metro
     */
    let firstDoubleQuote, lastDoubleQuote;

    /**
     * Cria a array que guarda os par??metros do comando
     */
    let parameters = [];

    /**
     * Loop que l?? os par??metros
     */
    do {
        if (command.trim().startsWith('"')) {
            /**
             * Cria duas variaveis que contem o inicio e o final do primeiro par??metro
             */
            firstDoubleQuote = command.indexOf('"');
            lastDoubleQuote = command.indexOf('"', 1);

            /**
             * Pusha o valor do par??metro para o array de par??metros
             */
            parameters.push(command.substring(firstDoubleQuote + 1, lastDoubleQuote));

            /**
             * Curtando o par??metro lido sobrando apenas os pr??ximos a serem computados
             */
            command = command.slice(lastDoubleQuote + 1).trim();
        } else return { status: false, parameters: [] };
    } while(command.trim().startsWith('"'));

    console.log('parameters', parameters);
    return { status: true, parameters };
}

async function handleStickerCommands(client, message, parameters = ['Xaakla Pack', 'Xaakla']) {
    const { caption } = message;

    const { from, t, quotedMsg, mimetype } = message;

    const uaOverride = "WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
    const isQuotedImage = quotedMsg && quotedMsg.type === 'image';
    const encryptMedia = isQuotedImage ? quotedMsg : message;
    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype;
    const mediaData = await decryptMedia(encryptMedia, uaOverride);
    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`;
    const params = {
        keepScale: true,
        pack: parameters[0],
        author: parameters[1]
    };

    client.sendImageAsSticker(from, imageBase64, params).then(() => {
        client.sendText(from, 'Here\'s your sticker');
        console.log(`Sticker Processed for ${processTime(t, moment())} Second`);
    }).catch((error) => {
        console.error('Sorry, Something went wrong while trying to process the sticker! Please try again later.', error);
        client.sendText('Sorry, Something went wrong while trying to process the sticker! Please try again later.');
    });
}

function changeStickerAuthorAndPackName(command) {
    return new Promise((resolve, reject) => {

        let author;
        let packName;

        /**
         * Verifica se a string inicia com '/' para ter certeza que ?? um comando
         */
        if (command.trim().startsWith('/')) {
            /**
             * Acha o primeiro espa??o vazio para separar o comando dos par??metros
             */
            let firstEmptySpace = command.indexOf(' ');
            /**
             * Remove o comando da string sobrando apenas os par??metros
             */
            command = command.slice(firstEmptySpace).trim();


            /**
             * Cria duas variaveis que contem o inicio e o final do primeiro par??metro
             */
            let firstDoubleQuote, lastDoubleQuote;

            /**
             * Cria a array que guarda os par??metros do comando
             */
            let parameters = [];

            /**
             * Loop que l?? os par??metros
             */
            do {
                if (string.trim().startsWith('"')) {
                    /**
                     * Cria duas variaveis que contem o inicio e o final do primeiro par??metro
                     */
                    firstDoubleQuote = string.indexOf('"');
                    lastDoubleQuote = string.indexOf('"', 1);

                    /**
                     * pusha o valor do par??metro para o array de par??metros
                     */
                    parameters.push(string.substring(firstDoubleQuote + 1, lastDoubleQuote));

                    /**
                     * Curtando o par??metro lido sobrando apenas os pr??ximos a serem computados
                     */
                    string = string.slice(lastDoubleQuote + 1).trim();
                }
            } while(string.trim().startsWith('"'));

            console.log('parameters', parameters);


            /**
             * Identifica onde come??a o primeiro par??metro
             */
            if (command.trim().startsWith('"')) {
                /**
                 * Cria duas variaveis que contem o inicio e o final do primeiro par??metro
                 */
                firstDoubleQuote = command.indexOf('"');
                lastDoubleQuote = command.indexOf('"', 1);

                /**
                 * Valor do primeiro par??metro
                 */
                packName = command.substring(firstDoubleQuote + 1, lastDoubleQuote);
                console.log(packName);

                /**
                 * Remove o primeiro par??metro da string sobrando apenas o segundo
                 */
                command = command.slice(lastDoubleQuote + 1).trim();

                /**
                 * Reavaliando as variaveis para indicar o inicio e o final do segundo par??metro
                 */
                firstDoubleQuote = command.indexOf('"');
                lastDoubleQuote = command.indexOf('"', 1);

                /**
                 * Valor do segundo par??metro
                 */
                author = command.substring(firstDoubleQuote + 1, lastDoubleQuote);
                console.log(author);

                resolve({
                    status: true,
                    author,
                    packName
                });

            } else {
                console.error('Erro ao ler os par??metros do comando, tente novamente.');
                reject({ status: false });
            }
        } else {
            console.error('Isto n??o ?? um comando v??lido...');
            reject({ status: false });
        }
    });
}

const options = {
    sessionId: 'Imperial',
    headless: true,
    qrTimeout: 0,
    authTimeout: 0,
    restartOnCrash: start,
    cacheEnabled: false,
    useChrome: true,
    killProcessOnBrowserClose: true,
    throwErrorOnTosBlock: false,
    chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0'
    ]
}


