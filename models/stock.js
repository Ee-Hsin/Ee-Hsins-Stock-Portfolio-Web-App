const yahooStockPrices = require('yahoo-stock-prices');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// ImageSchema.virtual('thumbnailIndex').get(function () {
//     return this.url.replace('/upload', '/upload/w_300');
// });

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
    units : {
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
    },
    description : {
        type: String,
        required: true
    },
    images : [ImageSchema] //it's an array
});

//DO NOT WRAP WITH CATCH ASYNC, BECAUSE CATCH ASYNC USES ARROW FUNCTIONS, WHICH USES ".this" differently!
StockSchema.virtual('currentPrice').get (async function () {
    const currPrice = await yahooStockPrices.getCurrentPrice(this.ticker);
    return currPrice;
});

// Virtual with returns
//DO NOT WRAP WITH CATCH ASYNC, BECAUSE CATCH ASYNC USES ARROW FUNCTIONS, WHICH USES ".this" differently!
StockSchema.virtual('returns').get(async function(){
    const currPrice = await yahooStockPrices.getCurrentPrice(this.ticker);
    const stockReturns = 100*(currPrice / this.price) -100;
    return Number.parseFloat(stockReturns).toFixed(2); //rounds to 2 decimal places.
});


module.exports = mongoose.model('Stock', StockSchema);