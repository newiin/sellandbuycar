const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }

});

FeedbackSchema.plugin(timestamps);
const Feedback = module.exports = mongoose.model('feedbacks', FeedbackSchema);