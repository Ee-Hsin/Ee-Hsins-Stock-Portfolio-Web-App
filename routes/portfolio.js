const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');

const compare = require('../utils/compareFunction')

const multer  = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });

const { validateStock, isLoggedIn, isAdmin } = require('../middleware.js');

const ExpressError = require('../utils/ExpressError');
const Stock = require('../models/stock');//can ship this off to individual route files.
const { response } = require('express');

router.get('/', catchAsync(async (req, res) => {
    const stocks = await Stock.find({});
    //Add a sorting method here.
    stocks.sort(compare);

    res.render('portfolio/index', {stocks})
}));

router.get('/new', isLoggedIn, isAdmin, (req, res,) => {
    res.render('portfolio/new');
});

router.post('/', isLoggedIn, isAdmin, upload.array('image'), validateStock, catchAsync(async (req, res) => {
    const stock = new Stock(req.body.stock);
    stock.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await stock.save();
    req.flash('success', 'Successfully added Stock')
    res.redirect(`/portfolio/${stock._id}`)
}));

router.get('/:id', catchAsync(async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock){
        req.flash('error', 'Cannot find that Stock!');
        return res.redirect('/portfolio')
    }
    //Adding financials to stock
    console.log("Getting Financial Info");
    stock.financials = await stock.financialInfo;
    console.log("Done!");

    res.render('portfolio/show', {stock});
}));

//My API Response to client side to send Candlestick data
router.get('/:id/getChartData', catchAsync(async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const candleData = await stock.oneYearCandleData;
    res.send(candleData);
}))

//My API Response to client side to send Returns data
router.get('/:id/getCurrentPriceAndReturns', catchAsync(async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const currentPriceAndReturns = await stock.currentPriceAndReturns;
    res.send(currentPriceAndReturns);
}))
//My API Response to client side to send ReturnsYTD data
router.get('/:id/getReturnsYTD', catchAsync(async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const returnsYTD = await stock.returnsYTD;
    res.send(returnsYTD);
}))

//My API Response to client side to send IV data
router.get('/:id/getIV', catchAsync(async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const IV = await stock.IV;
    res.send(IV);
}))

router.get('/:id/edit', isLoggedIn, isAdmin, catchAsync(async (req, res,) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock){
        req.flash('error', 'Cannot find that Stock!');
        return res.redirect('/portfolio')
    }
    res.render('portfolio/edit', { stock });
}));

router.put('/:id', isLoggedIn, isAdmin, upload.array('image'), validateStock, catchAsync(async (req, res) => {
    const { id } = req.params;
    const stock = await Stock.findByIdAndUpdate(id, { ...req.body.stock });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    stock.images.push(...imgs);
    await stock.save();

    //For deleting images
    if (req.body.deleteImages) { 
        for (let filename of req.body.deleteImages) { //loop through images to remove them from cloudinary
            await cloudinary.uploader.destroy(filename);
        }
        //no need for loop to iterate through for this one, it will pull all images where filename is in the req.body.deleteImages array.
        await stock.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully edited Stock')
    res.redirect(`/portfolio/${stock._id}`)
}));

router.delete('/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    //I can add functionality here to findId of stock, and delete all images associated with the stock.
    await Stock.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Stock')
    res.redirect('/portfolio');
}));

// //Error Handler (don't need, handled in app.js)
// router.all('*', (req,res) => {
//     req.flash('error', '404, that Page Does not Exist');
//     res.redirect('/portfolio')
// })

module.exports = router;