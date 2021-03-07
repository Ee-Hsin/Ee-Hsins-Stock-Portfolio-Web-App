// if (process.env.NODE_ENV !== "production") {
//     require('dotenv').config();
// }
//I guess I don't need it, I only need to put it one time on my app.js page I think

//Yahoo stock prices
const yahooStockPrices = require('yahoo-stock-prices');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Axios
const axios = require('axios');
const ExpressError = require('../utils/ExpressError');

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
StockSchema.virtual('currentPriceAndReturns').get (async function () {
    try{
        const currPrice = await yahooStockPrices.getCurrentPrice(this.ticker);
        const stockReturns = (100*(currPrice / this.price) -100).toFixed(2);
        return {currPrice, stockReturns};
    } catch(e){
        throw new ExpressError("There has been an error obtaining prices", 404);
    }

});


StockSchema.virtual('oneYearCandleData').get(async function(){
    const currTime = Math.round((new Date()).getTime() / 1000);
    const yearAgoTime = Math.round((new Date()).getTime() / 1000) - 365*24*60*60;
    try{
        const res = await axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${this.ticker}&resolution=D&from=${yearAgoTime}&to=${currTime}&token=${process.env.FINNHUB_API_KEY}`);
        const prices = res.data.c;
        const timeStamps = res.data.t;

        const dates = timeStamps.map(unixTimeStamp => {
            const date = new Date(unixTimeStamp * 1000)
            return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
        });

        return {prices, dates};

    } catch(e){
        throw new ExpressError("There has been an error obtaining chart prices", 404);
    }
})

StockSchema.virtual('returnsYTD').get(async function(){

    const currYear = (new Date()).getFullYear();
    const startOfYear = new Date(`1/1/${currYear}`)/1000;
    try{
        const res = await axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${this.ticker}&resolution=D&from=${startOfYear}&to=${startOfYear+5*60*60*24}&token=${process.env.FINNHUB_API_KEY}`);
        const startOfYearPrice = res.data.c[0]; //first day of the year
        const {currPrice} = await this.currentPriceAndReturns;

        const ytdStockReturns = 100*(currPrice / startOfYearPrice) -100;

        return ytdStockReturns.toFixed(2);

    } catch(e){
        throw new ExpressError("There has been an error obtaining chart prices", 404);
    }
})


module.exports = mongoose.model('Stock', StockSchema);