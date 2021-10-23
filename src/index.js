const { create, Client, decryptMedia } = require('@open-wa/wa-automate');
const moment = require('moment-timezone');

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
        console.log('message', message);

        const { from, t, type } = message;

        if (type === 'chat') {
            let { body } = message;

            if (!isACommand(body)) return console.error('There are no command to execute');

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
    console.log('entrou na função');
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

    switch (body) {
        case '/spam':
            await client.sendText(from, 'ovo manda');
            client.ghostForward('556293423942@c.us',
                ['false_556292045332@c.us_10F9EAEFF10D1AA7D315F0C8318356F7'], false)
                .then((response) => console.log('then => ', response))
                .catch((error) => console.error('catch => ', error));
            await client.sendText(from, 'ô mandei');
            break;
        case '/battery':
            client.getBatteryLevel()
                .then((response) => client.sendText(from, `Sua bateria está ${response}%`))
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
     * Cria duas variaveis que contem o inicio e o final do primeiro parâmetro
     */
    let firstDoubleQuote, lastDoubleQuote;

    /**
     * Cria a array que guarda os parâmetros do comando
     */
    let parameters = [];

    /**
     * Loop que lê os parâmetros
     */
    do {
        if (command.trim().startsWith('"')) {
            /**
             * Cria duas variaveis que contem o inicio e o final do primeiro parâmetro
             */
            firstDoubleQuote = command.indexOf('"');
            lastDoubleQuote = command.indexOf('"', 1);

            /**
             * Pusha o valor do parâmetro para o array de parâmetros
             */
            parameters.push(command.substring(firstDoubleQuote + 1, lastDoubleQuote));

            /**
             * Curtando o parâmetro lido sobrando apenas os próximos a serem computados
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
         * Verifica se a string inicia com '/' para ter certeza que é um comando
         */
        if (command.trim().startsWith('/')) {
            /**
             * Acha o primeiro espaço vazio para separar o comando dos parâmetros
             */
            let firstEmptySpace = command.indexOf(' ');
            /**
             * Remove o comando da string sobrando apenas os parâmetros
             */
            command = command.slice(firstEmptySpace).trim();


            /**
             * Cria duas variaveis que contem o inicio e o final do primeiro parâmetro
             */
            let firstDoubleQuote, lastDoubleQuote;

            /**
             * Cria a array que guarda os parâmetros do comando
             */
            let parameters = [];

            /**
             * Loop que lê os parâmetros
             */
            do {
                if (string.trim().startsWith('"')) {
                    /**
                     * Cria duas variaveis que contem o inicio e o final do primeiro parâmetro
                     */
                    firstDoubleQuote = string.indexOf('"');
                    lastDoubleQuote = string.indexOf('"', 1);

                    /**
                     * pusha o valor do parâmetro para o array de parâmetros
                     */
                    parameters.push(string.substring(firstDoubleQuote + 1, lastDoubleQuote));

                    /**
                     * Curtando o parâmetro lido sobrando apenas os próximos a serem computados
                     */
                    string = string.slice(lastDoubleQuote + 1).trim();
                }
            } while(string.trim().startsWith('"'));

            console.log('parameters', parameters);


            /**
             * Identifica onde começa o primeiro parâmetro
             */
            if (command.trim().startsWith('"')) {
                /**
                 * Cria duas variaveis que contem o inicio e o final do primeiro parâmetro
                 */
                firstDoubleQuote = command.indexOf('"');
                lastDoubleQuote = command.indexOf('"', 1);

                /**
                 * Valor do primeiro parâmetro
                 */
                packName = command.substring(firstDoubleQuote + 1, lastDoubleQuote);
                console.log(packName);

                /**
                 * Remove o primeiro parâmetro da string sobrando apenas o segundo
                 */
                command = command.slice(lastDoubleQuote + 1).trim();

                /**
                 * Reavaliando as variaveis para indicar o inicio e o final do segundo parâmetro
                 */
                firstDoubleQuote = command.indexOf('"');
                lastDoubleQuote = command.indexOf('"', 1);

                /**
                 * Valor do segundo parâmetro
                 */
                author = command.substring(firstDoubleQuote + 1, lastDoubleQuote);
                console.log(author);

                resolve({
                    status: true,
                    author,
                    packName
                });

            } else {
                console.error('Erro ao ler os parâmetros do comando, tente novamente.');
                reject({ status: false });
            }
        } else {
            console.error('Isto não é um comando válido...');
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

create(options)
    .then((client) => start(client))
    .catch((err) => new Error(err));
