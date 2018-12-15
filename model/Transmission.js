const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const Schema = mongoose.Schema;

const TransmissionSchema = new Schema({

    transmission: {
        type: String
    }


});

TransmissionSchema.plugin(timestamps);
const Transmission = module.exports = mongoose.model('transmissions', TransmissionSchema);