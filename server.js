const express = require('express');
const compression = require('compression');
const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const request = require('request');

app.use(express.static('dist', {index: 'demo.html'}));
app.use(compression());
app.use(bodyParser.json());

function sendTelegramMessage(chatId, text) {
    console.log("[chat-" + chatId + "] " + text);
    request
        .post('https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN + '/sendMessage')
        .form({
            "chat_id": chatId,
            "text": text,
            "parse_mode": "Markdown"
        });
}

app.post('/hook', function(req, res){
    const chatId = req.body.message.chat.id;
    const name = req.body.message.chat.first_name || "admin";
    const text = req.body.message.text || "";
    const reply = req.body.message.reply_to_message;

    if (text.startsWith("/start")) {
        sendTelegramMessage(chatId,
            "*Welcome to Intergram* \n" +
            "Your unique chat id is `" + chatId + "`\n" +
            "Use it to link between the embedded chat and this telegram chat");
    } else if (reply){
        let replyText = reply.text || "";
        let userId = replyText.split(':')[0];
        io.emit(chatId + "-" + userId, name + ": " + text);
    } else {
        io.emit(chatId, name + ": " + text);
    }

    res.statusCode = 200;
    res.end();
});

io.on('connection', function(client){

    client.on('register', function(registerMsg){
        let userId = registerMsg.userId;
        let chatId = registerMsg.chatId;

        client.on('message', function(msg) {
            sendTelegramMessage(chatId, userId + ": " + msg);
        });

        client.on('disconnect', function(){
            sendTelegramMessage(chatId, userId + " has left");
        });
    });

});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on port:' + (process.env.PORT || 3000));
});
