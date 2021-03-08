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
        // const res = await axios.get(`https://sandbox.iexapis.com/stable/stock/${this.ticker}/quote/latestPrice?token=${process.env.IEX_CLOUD_SANDBOX_KEY}`);
        // const currPrice = res.data;
        const currPrice = await yahooStockPrices.getCurrentPrice(this.ticker); //Yahoo is much faster and we don't have to worry about using tokens.
        const stockReturns = (100*(currPrice / this.price) -100).toFixed(2);
        return {currPrice, stockReturns};
    } catch(e){
        throw new ExpressError(`There has been an error obtaining current prices. Error message is: ${e}`, 404);
    }

});


StockSchema.virtual('oneYearCandleData').get(async function(){
    const currTime = Math.round((new Date()).getTime() / 1000);
    const yearAgoTime = Math.round((new Date()).getTime() / 1000) - 365*24*60*60;
    try{

        const res = await axios.get(`https://sandbox.iexapis.com/stable/stock/${this.ticker}/chart/1y?chartCloseOnly=true&chartInterval=5&token=${process.env.IEX_CLOUD_SANDBOX_KEY}`);
        /* For when deploying:
        const res = await axios.get(`https://cloud.iexapis.com/stable/stock/${this.ticker}/chart/1y?chartCloseOnly=true&chartInterval=5&token=${process.env.IEX_CLOUD_API_KEY}`);*/

        const prices = res.data.map((candle) => {
            return candle.close;
        })

        const dates = res.data.map((candle) => {
            return candle.date;
        })

        return {prices,dates};

    } catch(e){
        //can't use next() (I kinda forgot), that is only for async functions invoked by middleware and route handlers, this is not that case.
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

StockSchema.virtual('financialInfo').get(async function(){
    try{
        const res = await axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=${this.ticker}&metric=all&token=${process.env.FINNHUB_API_KEY}`);
        const currentRatio = res.data.metric.currentRatioQuarterly.toFixed(2);
        const debtOverEquity = (res.data.metric["totalDebt/totalEquityQuarterly"]/100).toFixed(2);
        const longTermDebtOverEquity = (res.data.metric["longTermDebt/equityQuarterly"]/100).toFixed(2);
        const returnOnEquity = res.data.metric.roeRfy.toFixed(2);
        const epsPast5Y = res.data.metric.epsGrowth5Y.toFixed(2);
        const historicalEps = res.data.series.annual.eps;

        return {currentRatio, debtOverEquity, longTermDebtOverEquity, returnOnEquity, epsPast5Y, historicalEps};
        
    } catch(e){
        throw new ExpressError("There has been an error obtaining financial data", 404);
    }

})


module.exports = mongoose.model('Stock', StockSchema);