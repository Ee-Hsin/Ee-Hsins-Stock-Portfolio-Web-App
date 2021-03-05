const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { validateStock, isLoggedIn, isAdmin } = require('../middleware.js');

const ExpressError = require('../utils/ExpressError');
const Stock = require('../models/stock')//can ship this off to individual route files.

router.get('/', catchAsync(async (req, res) => {
    const stocks = await Stock.find({});
    //Add a sorting method here.
    res.render('portfolio/index', {stocks})
}));

router.get('/new', isLoggedIn, isAdmin, (req, res,) => {
    res.render('portfolio/new');
});

router.post('/', isLoggedIn, isAdmin, validateStock, catchAsync(async (req, res) => {
    const stock = new Stock(req.body.stock);
    await stock.save();
    req.flash('success', 'Successfully added Stock')
    res.redirect(`/portfolio/${stock._id}`)
}));

router.get('/:id', catchAsync(async (req, res,) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock){
        req.flash('error', 'Cannot find that Stock!');
        return res.redirect('/portfolio')
    }
    const currentPrice = await stock.currentPrice;
    res.render('portfolio/show', { stock, currentPrice });
}));

router.get('/:id/edit', isLoggedIn, isAdmin, catchAsync(async (req, res,) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock){
        req.flash('error', 'Cannot find that Stock!');
        return res.redirect('/portfolio')
    }
    res.render('portfolio/edit', { stock });
}));

router.put('/:id', isLoggedIn, isAdmin, validateStock, catchAsync(async (req, res) => {
    const { id } = req.params;
    const stock = await Stock.findByIdAndUpdate(id, { ...req.body.stock });
    req.flash('success', 'Successfully edited Stock')
    res.redirect(`/portfolio/${stock._id}`)
}));

router.delete('/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
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