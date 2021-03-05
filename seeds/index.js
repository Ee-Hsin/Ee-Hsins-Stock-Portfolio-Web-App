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
        category: 'Large Cap Growth'
    },
    {
        name: 'Microsoft',
        ticker: 'MSFT',
        price: 220,
        IV : '220',
        category: 'Large Cap Growth'
    },
    {
        name: 'Cost Co',
        ticker: 'COST',
        price: 430,
        category: 'Large Cap Predictable'
    }
]

const seedDB = async () => {
    await Stock.deleteMany({});
    await Stock.insertMany(seedProducts);
}

seedDB().then(() => { //calling the seedDB function
    mongoose.connection.close();
})