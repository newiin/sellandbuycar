const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

    name: {
        type: String,

    },
    email: {
        type: String,

        unique: true,

    },
    password: {
        type: String,

        minlength: 6
    },
    userToken: {
        type: String,
    },
    expireToken: {
        type: Date

    },
    phone: {
        type: String,
    },
    rule: {
        type: String,

        default: "user"
    },
    city: {
        type: Schema.Types.ObjectId,
        ref: 'cities'
    }

});

UserSchema.plugin(timestamps);
const User = module.exports = mongoose.model('users', UserSchema);
module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });

}

module.exports.getUserByEmail = function(email, callback) {
    var query = {
        'email': email
    };
    User.findOne(query, callback);
}


module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}