//Node’i WebSocket’i sisaldamine.
const http = require('http');
const fs = require('fs');
const ws = require('ws');

//Serveri seadistamine
const wss = new ws.Server({ noServer: true });

function accept(req, res) {
    if (req.url === '/ws' && req.headers.upgrade &&
        req.headers.upgrade.toLowerCase() === 'websocket' &&
        req.headers.connection.match(/\bupgrade\b/i)) {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    } else if (req.url === '/') {
        // Отправляем index.html
        fs.createReadStream('./index.html').pipe(res);
    } else {
        // Страница не найдена
        res.writeHead(404);
        res.end();
    }
}
//Ühenduse loomine
const clients = new Set();

function onSocketConnect(ws) {
    clients.add(ws);

    ws.on('message', function(message) {
        message = message.slice(0, 50); // максимальная длина сообщения — 50 символов
        for (let client of clients) {
            client.send(message);
        }
    });

    ws.on('close', function() {
        log('connection closed');
        clients.delete(ws);
    });
}
//Teksti kuvamine
let log;

if (!module["parent"]) {
    log = console.log;
    http.createServer(accept).listen(8080);
} else {
    log = function() {};
    // log = console.log;
    exports.accept = accept;
}