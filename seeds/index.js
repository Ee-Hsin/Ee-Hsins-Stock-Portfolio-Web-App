const mongoose = require('mongoose');
const Stock = require('../models/stock');

mongoose.connect('mongodb://localhost:27017/stock-portfolio', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

seedProducts = [
    {
        name: 'Adobe',
        ticker: 'ADBE',
        price: 430,
        units: 6,
        IV: '460',
        category: 'Large Cap Growth',
        description: 'Software company that has a strong economic moat due to a lack of competitors and high switching costs of products',
        image: '../public/images/Adobe_logo.jpg'

    },
    {
        name: 'Microsoft',
        ticker: 'MSFT',
        price: 220,
        units: 27,
        IV : '220',
        category: 'Large Cap Growth',
        description: 'Software company that has a strong economic moat due to a lack of competitors and high switching costs of products, as well as strong growth drivers due to cloud computing',
        image: '../public/images/Microsoft_logo.jpg'
    }
]

const seedDB = async () => {
    await Stock.deleteMany({});
    await Stock.insertMany(seedProducts);
}

seedDB().then(() => { //calling the seedDB function
    mongoose.connection.close();
})