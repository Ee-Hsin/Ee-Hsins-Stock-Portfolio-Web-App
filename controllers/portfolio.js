const Stock = require('../models/stock');
const compare = require('../utils/compareFunction')

module.exports.index = async (req, res) => {
    const stocks = await Stock.find({});
    //Add a sorting method here.
    stocks.sort(compare);
    res.render('portfolio/index', {stocks});
};

module.exports.renderNewStockForm = async (req, res) => {
    res.render('portfolio/new');
};

module.exports.createNewStock = async (req, res) => {
    const stock = new Stock(req.body.stock);
    stock.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await stock.save();
    req.flash('success', 'Successfully added Stock')
    res.redirect(`/portfolio/${stock._id}`)
};

module.exports.showStock = async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock){
        req.flash('error', 'Cannot find that Stock!');
        return res.redirect('/portfolio')
    }
    res.render('portfolio/show', {stock});
};

module.exports.sendChartData= async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const candleData = await stock.oneYearCandleData;
    res.send(candleData);
};

module.exports.sendReturns = async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const currentPriceAndReturns = await stock.currentPriceAndReturns;
    res.send(currentPriceAndReturns);
};

module.exports.sendReturnsYTD = async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const returnsYTD = await stock.returnsYTD;
    res.send(returnsYTD);
};

module.exports.sendIV = async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const IV = await stock.IV;
    res.send(IV);
};

module.exports.sendFinancials = async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const financials = await stock.financialInfo;
    res.send(financials);
};

module.exports.sendDTE = async (req,res) => {
    const stock = await Stock.findById(req.params.id);
    const DTE = await stock.debtToEbitda;
    res.send(DTE);
};

module.exports.renderEditForm = async (req, res,) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock){
        req.flash('error', 'Cannot find that Stock!');
        return res.redirect('/portfolio')
    }
    res.render('portfolio/edit', { stock });
};

module.exports.updateStock = async (req, res) => {
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
};

module.exports.deleteStock = async (req, res) => {
    const { id } = req.params;
    //I can add functionality here to findId of stock, and delete all images associated with the stock.
    await Stock.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Stock')
    res.redirect('/portfolio');
};