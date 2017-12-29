var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));
app.set("view engine", "ejs");
app.set("views", "./views");

server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
    res.render("index");
});

var db = require('./db');


io.on('connection', function (socket) {
    console.log(socket.id + ' connection');

    db.loadingfirstsell_buy(1, 10, "sell")
        .then((result) => { socket.emit('loadingfirstsell', result); })
        .catch((err) => console.log(err));

    db.loadingfirstsell_buy(1, 10, "buy")
        .then((result) => { socket.emit('loadingfirstbuy', result); })
        .catch((err) => console.log(err));

    db.loadingfirsthistory(1, 10)
        .then((result) => { socket.emit('loadingfirsthistory', result); })
        .catch((err) => console.log(err));

    socket.on('check login', function (data) {
        var name = JSON.parse(data).name;
        var pass = JSON.parse(data).pass;
        db.checklogin(name, pass).then((result) => {
            socket.emit('login check account', result);
        });
    });

    socket.on('try account', function () {
        db.tryaccounts().then((result) => {
            socket.emit('try account added', result);
        });
    });

    // Sell
    socket.on('sell_val', function (data) {
        var market = data.market;
        var price_per = data.price_per;
        var btc = data.btc;
        var usd = data.usd;
        var type = data.type;
        var id = data.id;

        db.sell_customer(market, price_per, btc, usd, type, id)
            .then((result) => {
                if (JSON.parse(result).sell === "exists" || JSON.parse(result).buy === "exists") {
                    socket.emit('sell_val_res', result);
                } else {
                    io.sockets.emit('sell_val_res', result);
                }
            })
            .catch((err) => console.log(err));

    });

    //Buy
    socket.on('buy_val', function (data) {
        var market = data.market;
        var price_per = data.price_per;
        var btc = data.btc;
        var usd = data.usd;
        var type = data.type;
        var id = data.id;

        db.buy_customer(market, price_per, btc, usd, type, id)
            .then((result) => {
                io.sockets.emit('buy_val_res', result);
            })
            .catch((err) => console.log(err));

    });







    socket.on('disconnect', function () {
        io.emit('user disconnected');
        console.log(socket.id + ' disconnect');
    });
});