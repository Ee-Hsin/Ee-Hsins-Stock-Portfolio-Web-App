const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Everytime we update this Schema, we have to re-seed, and update our JOI as well.

const StockSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ticker: {
        type: String,
        required: true
    },
    price : {
        type: Number,
        required: true
    },
    IV : {
        type: String,
        default: "N/A",
    },
    category : {
        type: String,
        required: true
    }
    
});

module.exports = mongoose.model('Stock', StockSchema);