const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const Schema = mongoose.Schema;

const ConditionSchema = new Schema({

    condition: {
        type: String

    }


});

ConditionSchema.plugin(timestamps);
const Condition = module.exports = mongoose.model('conditions', ConditionSchema);