const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const Schema = mongoose.Schema;

const MakeSchema = new Schema({

    makeName: {
        type: String

    },
    slug: {
        type: String,
        unique: true
    }

});

MakeSchema.plugin(timestamps);
const Make = module.exports = mongoose.model('makes', MakeSchema);