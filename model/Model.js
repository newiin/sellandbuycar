const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const Schema = mongoose.Schema;

const ModelSchema = new Schema({
    make: {
        type: Schema.Types.ObjectId,
        ref: 'makes'
    },
    name: {
        type: String

    }


});

ModelSchema.plugin(timestamps);
const Model = module.exports = mongoose.model('models', ModelSchema);