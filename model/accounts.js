var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
  acc_name: { type: String ,unique:true},
  acc_pass: { type: String },
  acc_btc: { type: Number },
  acc_usd: { type: Number },
  acc_create_date: { type: Date, default: Date.now }
});

accountSchema.set('versionKey', false);
accountSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('accounts', accountSchema,'accounts');

