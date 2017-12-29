var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var historySchema = new Schema({
    market: { type: String },
    type: { type: String },
    category: { exchange: Number, waiting: Number },
    price_share: { type: Number },
    amount_usd: { type: Number },
    fee: { type: Number },
    total: { type: Number },
    transaction_date: { type: Date, default: Date.now },
    personal: { sell: Schema.Types.ObjectId, buy: Schema.Types.ObjectId },
});

historySchema.set('versionKey', false);
historySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('history', historySchema, 'history');

