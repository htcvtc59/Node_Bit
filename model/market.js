
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var marketSchema = new Schema({
  price_per_btc: { type: Number },
  btc_amount: { type: Number },
  fee: { type: Number },
  type: { type: String },
  total: { type: Number },
  personal: { type: Schema.Types.ObjectId },
  createdat: { type: Date, default: Date.now },
  category: { waiting: Number, exchange: Number }
});

marketSchema.set('versionKey', false);
marketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('market', marketSchema,'market');

