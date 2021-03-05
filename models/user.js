const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');
//We just need passport local mongoose for this model.

//Create a Schema (We don't need to include password and username in here)
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose); /*This will add in a password and 
username for us*/

//Create model and export
module.exports = mongoose.model('User', UserSchema);