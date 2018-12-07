const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAlgolia = require('mongoose-algolia');

const Schema = mongoose.Schema;

const Vehiclechema = new Schema({
    model: {
        type: Schema.Types.ObjectId,
        ref: 'models'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    title: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    fuel: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    transmission: {
        type: Schema.Types.ObjectId,
        ref: 'transmissions'
    },
    speed: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    condition: {
        type: Schema.Types.ObjectId,
        ref: 'conditions'
    },
    isApprouved: {
        type: Boolean,
        default: false
    }



});
Vehiclechema.plugin(mongooseAlgolia, {
    appId: 'T0Q2S0R1MH',
    apiKey: '8d1b67e13d4006724e072d0f9d0c13c3',
    indexName: 'Vehiclechema', //The name of the index in Algolia, you can also pass in a function
    selector: 'title user.name make.makeName model.name condition.condition',
    populate: 'user',
    populate: 'condition',
    populate: 'tranmission',
    populate: {
        path: 'model',
        populate: {
            path: 'make'
        }
    },
    defaults: {
        author: 'unknown'
    },
    virtuals: {
        whatever: function(doc) {
            return `Custom data ${doc.title}`
        }
    },
    filter: function(doc) {
        return !doc.softdelete
    },
    debug: true // Default: false -> If true operations are logged out in your console
});

Vehiclechema.plugin(timestamps);
Vehiclechema.plugin(mongoosePaginate);

const Model = module.exports = mongoose.model('vehicles', Vehiclechema);

Model.SyncToAlgolia();
Model.SetAlgoliaSettings({
    searchableAttributes: ['title', 'user.name', 'make.makeName', 'model.name']
});
module.exports = Model;