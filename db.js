//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection

// var mongoDB = 'mongodb://localhost:27017/bitdb';
var mongoDB = 'mongodb://htcvtc59:GTj5xX7Z@ds163796.mlab.com:63796/bitweb';

mongoose.connect(mongoDB, {
    useMongoClient: true,
    reconnectInterval: 500
});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var accountmodel = require('./model/accounts');
var marketmodel = require('./model/market');
var historymodel = require('./model/history');


let loadingfirsthistory = (page, limit) => {
    let skip = (page - 1) * limit;
    return historymodel.find().limit(limit).skip(skip).exec();
}

let loadingfirstsell_buy = (page, limit, sell_buy) => {
    let skip = (page - 1) * limit;
    return marketmodel.find({ $text: { $search: sell_buy } })
        .and({ "category.waiting": 1 })
        .and({ "category.exchange": 0 })
        .limit(limit).skip(skip)
        .sort({ '_id': -1 }).exec();
}

// try account

let tryaccounts = async () => {
    return new Promise((resolve, reject) => {
        var account = new accountmodel({
            acc_name: "name_" + Math.floor((Math.random() * 100) + 1),
            acc_pass: "1234",
            acc_btc: 1000,
            acc_usd: 10000
        });
        account.save((err) => {
            if (err) {
                reject(err);
            } else {
                resolve(account.toJSON());
            }
        });
    });
}

//Check Login
let checklogin = (name, pass) => {
    return accountmodel.findOne({ "acc_name": name, "acc_pass": pass }).exec();
}

// var async = require('async');


//Sell

let find_sell_buy_customer = (price_per, btc, usd, type, waiting, exchange, personal) => {
    return new Promise((resolve, reject) => {
        marketmodel.findOne({ "price_per_btc": price_per })
            .and({ "btc_amount": btc }).and({ "type": type })
            .and({ "personal": { $ne: mongoose.Types.ObjectId(personal) } })
            .and({ "total": usd }).and({ "category.waiting": waiting })
            .and({ "category.exchange": exchange })
            .sort({ 'createdat': 1 }).exec()
            .then((res) => resolve(res))
            .catch((err) => reject(new Error(err)));
    });
}

let find_sell_buy_customer_exists = (price_per, btc, usd, type, waiting, exchange, personal) => {
    return new Promise((resolve, reject) => {
        marketmodel.findOne({ "price_per_btc": price_per })
            .and({ "btc_amount": btc }).and({ "type": type })
            .and({ "personal": { $eq: mongoose.Types.ObjectId(personal) } })
            .and({ "total": usd }).and({ "category.waiting": waiting })
            .and({ "category.exchange": exchange })
            .sort({ 'createdat': 1 }).exec()
            .then((res) => resolve(res))
            .catch((err) => reject(new Error(err)));
    });
}

let sell_buy_customer_update = (id, waiting, exchange) => {
    return new Promise((resolve, reject) => {
        marketmodel.findById(id, (err, doc) => {
            if (err) {
                reject(new Error(err));
            } else {
                doc.category.waiting = waiting;
                doc.category.exchange = exchange;
                doc.save();
                resolve(doc.toJSON());
            }
        });
    });
}

let insert_sell_buy_customer = (market, price_per, btc, usd, fee,
    type, id, waiting, exchange) => {
    return new Promise((resolve, reject) => {
        var market = new marketmodel({
            price_per_btc: price_per,
            btc_amount: btc,
            fee: fee,
            type: type,
            total: usd,
            personal: mongoose.Types.ObjectId(id),
            category: { waiting: waiting, exchange: exchange }
        });
        market.save(function (err) {
            if (err) {
                reject(new Error(err));
            } else {
                marketmodel.findById(market._id, function (err, found) {
                    resolve(market.toJSON());
                });
            }
        });
    });
}

let sell_buy_history = (market, type, price_share, amount_usd, fee, total, idsell, idbuy) => {
    return new Promise((resolve, reject) => {
        var history = new historymodel({
            market: market,
            type: type,
            category: { waiting: 0, exchange: 1 },
            price_share: price_share,
            amount_usd: amount_usd,
            fee: fee,
            total: total,
            personal: {
                sell: mongoose.Types.ObjectId(idsell),
                buy: mongoose.Types.ObjectId(idbuy)
            },
        });

        history.save(function (err) {
            if (err) {
                reject(new Error(err));
            } else {
                historymodel.findById(history._id, function (err, found) {
                    resolve(history.toJSON());
                });
            }
        });
    });
}

let sell_customer = async (market, price_per, btc, usd, type, id) => {
    try {
        let resexists = await find_sell_buy_customer_exists(price_per, btc, usd, type, 1, 0, id);
        if (resexists != null) {
            return Promise.resolve(JSON.stringify({ sell: "exists" }));
        } else {
            let res = await find_sell_buy_customer(price_per, btc, usd, "buy", 1, 0, id);
            if (res != null) {
                let resultbuy = await sell_buy_customer_update(res._id, 0, 1);
                let ressell = await insert_sell_buy_customer(market, price_per, btc, usd, 0.12, type, id, 0, 1);
                let ressellhistory = await sell_buy_history("btc", "buy", price_per, usd, 0.12, btc, id, resultbuy.personal);
                return Promise.resolve(JSON.stringify({ sell: ressell, buy: resultbuy, history: ressellhistory }));
            } else {
                let ressell = await insert_sell_buy_customer(market, price_per, btc, usd, 0.12, type, id, 1, 0);
                return Promise.resolve(JSON.stringify({ sell: ressell }));
            }
        }
    } catch (err) {
        return Promise.reject(new Error(err));
    }
}

let buy_customer = async (market, price_per, btc, usd, type, id) => {
    try {
        let resexists = await find_sell_buy_customer_exists(price_per, btc, usd, type, 1, 0, id);
        if (resexists != null) {
            return Promise.resolve(JSON.stringify({ buy: "exists" }));
        } else {
            let res = await find_sell_buy_customer(price_per, btc, usd, "sell", 1, 0, id);
            if (res != null) {
                let resultsell = await sell_buy_customer_update(res._id, 0, 1);
                let resbuy = await insert_sell_buy_customer(market, price_per, btc, usd, 0.12, type, id, 0, 1);
                let resbuyhistory = await sell_buy_history("btc", "sell", price_per, usd, 0.12, btc, id, resultsell.personal);
                return Promise.resolve(JSON.stringify({ buy: resbuy, sell: resultsell, history: resbuyhistory }));
            } else {
                let resbuy = await insert_sell_buy_customer(market, price_per, btc, usd, 0.12, type, id, 1, 0);
                return Promise.resolve(JSON.stringify({ buy: resbuy }));
            }
        }
    } catch (err) {
        return Promise.reject(new Error(err));
    }
}

// find_sell_buy_customer_exists(12, 123, 4315, "sell", 1, 0, "5a463f358276cf21b0815cd0")
//     .then(res => console.log(res));

// sell_customer("0", 12, 123, 4342, "sell", "5a463f358276cf21b0815cd0")
//     .then(res => console.log(res));

// buy_customer("0", 16, 0.12, 10000, "buy", "5a3f542fa5446c23dc8c427d")
//     .then(res => console.log(res));

// 5a3f5423a5446c23dc8c427c
// 5a3f542fa5446c23dc8c427d

module.exports.loadingfirsthistory = loadingfirsthistory;
module.exports.loadingfirstsell_buy = loadingfirstsell_buy;
module.exports.tryaccounts = tryaccounts;
module.exports.checklogin = checklogin;
module.exports.sell_customer = sell_customer;
module.exports.buy_customer = buy_customer;






// abc();

function abc() {
    var market = new marketmodel({
        price_per_btc: 16,
        btc_amount: 0.12,
        fee: 0.23,
        type: "sell",
        total: 10000,
        personal: mongoose.Types.ObjectId("5a3f542fa5446c23dc8c427d"),
        category: { waiting: 1, exchange: 0 }
    });

    market.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            marketmodel.findById(market._id, function (err, found) {
                console.log(market.toJSON());
            });
        }
    });
}




// loadingfirstsell_buy(1,4,"buy")
// .then((result)=>{console.log(result)});

// loadingfirsthistory(1, 3).then((result) => {
//     // console.log(JSON.stringify(result));
//     // console.log(result);
// }).catch(err => console.log(err));

// var history = new historymodel({
//     market: "btc",
//     type: "sell",
//     category: { waiting: 0, exchange: 1 },
//     price_share: 0.01,
//     amount_usd: 1000,
//     fee: 0.15,
//     total: 100,
//     personal: {
//         sell: mongoose.Types.ObjectId("5a44b1a6f313ae141c268bee"),
//         buy: mongoose.Types.ObjectId("5a44b1a6f313ae141c268bee")
//     },

// });

// history.save(function (err) {
//     if (err) {
//         console.log(err);
//     } else {
//         historymodel.findById(history._id, function (err, found) {
//             console.log(history.toJSON());
//         });
//     }
// });




// var account = new accountmodel({
//     acc_name: "name_" + Math.floor((Math.random() * 100) + 1),
//     acc_pass: "1234",
//     acc_btc: 1000,
//     acc_usd: 10000
// });

// account.save(function (err) {
//     if (err) {
//         console.log(err);
//     } else {
//         accountmodel.findById(account._id,function(err,found){
//             console.log(account.toJSON());
//             console.log(found._id);
//        });
//     }
// });

// let insertaccounts = async (acc_name, acc_pass, acc_btc, acc_usd) => {

// }

