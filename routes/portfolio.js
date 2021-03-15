const express = require('express');
const router = express.Router({ mergeParams: true });
const portfolio = require('../controllers/portfolio');
const catchAsync = require('../utils/catchAsync');
const { validateStock, isLoggedIn, isAdmin } = require('../middleware.js');
const multer  = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });

//No need these two after refactoring:
const Stock = require('../models/stock');//can ship this off to individual route files.
const compare = require('../utils/compareFunction')

router.route('/')
    .get(catchAsync(portfolio.index))
    .post(isLoggedIn, isAdmin, upload.array('image'), validateStock, catchAsync(portfolio.createNewStock))

router.get('/new', isLoggedIn, isAdmin, portfolio.renderNewStockForm);

//My API Response to client side to send Total Returns
router.get('/getTotalReturns', catchAsync(portfolio.sendTotalReturns));

router.route('/:id')
    .get(catchAsync(portfolio.showStock))
    .put(isLoggedIn, isAdmin, upload.array('image'), validateStock, catchAsync(portfolio.updateStock))
    .delete(isLoggedIn, isAdmin, catchAsync(portfolio.deleteStock));

//TO render edit form:
router.get('/:id/edit', isLoggedIn, isAdmin, catchAsync(portfolio.renderEditForm));

//SENDING BACK DATA STUFF:
//My API Response to client side to send Candlestick data
router.get('/:id/getChartData', catchAsync(portfolio.sendChartData));
//My API Response to client side to send Returns data
router.get('/:id/getCurrentPriceAndReturns', catchAsync(async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const currentPriceAndReturns = await stock.currentPriceAndReturns;
    res.send(currentPriceAndReturns);
}));
//My API Response to client side to send ReturnsYTD data
router.get('/:id/getReturnsYTD', catchAsync(portfolio.sendReturnsYTD));
//My API Response to client side to send IV data
router.get('/:id/getIV', catchAsync(portfolio.sendIV));
//My API Response to client side to send Financial data
router.get('/:id/getFinancials', catchAsync(portfolio.sendFinancials));
//My API Response to client side to send DebtToEbitda
router.get('/:id/getDTE', catchAsync(portfolio.sendDTE));
//My API Response to client side to send Net Liquidation
router.get('/:id/getIndiPortfolioAllocation', catchAsync(portfolio.sendIndiPortfolioAllocation));


// //Error Handler (don't need, handled in app.js)
// router.all('*', (req,res) => {
//     req.flash('error', '404, that Page Does not Exist');
//     res.redirect('/portfolio')
// })

module.exports = router;