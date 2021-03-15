if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const sendMail = require('./mail.js');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const portfolioRoutes = require('./routes/portfolio');
const catchAsync = require("./utils/catchAsync");

const MongoDBStore = require('connect-mongo');

/*COMMANDS:
1. Press CTRL+D while selecting something to select another one, and keep
pressing to eventualy select all.
2. Presss SHIFT+ALT+DOWNARROWKEY to duplicate a line below
3. Press ALT and highlight things to highlight multiple things at once
*/

//This was we use DB_URL when in production mode, but since we have it in our local .env file, it will use DB_URL in local mode as well.
//localhost is just a fallback for if we don't have DB_URL in our .env file.
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/stock-portfolio';

//Connecting to Mongoose Database
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//Starting the express app
const app = express(); 

//Setting up EJS
app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs');

//Setting views as default folder
app.set('views',path.join(__dirname, '/views')); 

//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true }));
// To parse incoming JSON in POST request body:
app.use(express.json()); 

//For method override
app.use(methodOverride('_method'));

//Serve static files to client side
app.use(express.static(path.join(__dirname, 'public')));

//To sanitize Query String Injections:
app.use(mongoSanitize({replaceWith: '_'}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //We are lazy updating the session instead of every refresh. This is in seconds (not milliseconds unlike the one down below), so it will update every 24 hrs in this case.
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

//Setting up session config
const sessionConfig = {
    store,
    name: 'session', //the new Session name instead of the default connect.sid
    secret,/*Eventually will be an actual secret
    in production*/
    resave: false,
    saveUninitialized: true,
    cookie: { //configuring the cookie
        httpOnly: true,
        //secure: true, //So cookie only works over HTTPS
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
//Setting up session with the sessionConfig
app.use(session(sessionConfig))
//Setting up Flash
app.use(flash()); 

//Using Helmet
app.use(helmet());

//Configuring our own content security policy
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com/",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
];
const connectSrcUrls = [];
const fontSrcUrls = [
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com/",
];


app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgieekvvm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//This middleware is required for Express and Connect-Based applications 
app.use(passport.initialize());
//This is required for persistent login sessions (Don't 
//put this if you are dealing with an API), 
//And place this app.use(session())) BEFORE this
app.use(passport.session());
//Authentication Strategy (Local in this case)
passport.use(new LocalStrategy(User.authenticate()));

// Use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); //How we store the user in the session
passport.deserializeUser(User.deserializeUser()); //How to unstore the user in the session

//Using flash so it appears in all our local ejs files that we render
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.adminId = process.env.ADMIN_USER_ID;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//ROUTES

app.get('/', (req, res) => {
    res.render('home')
});

app.use('/', userRoutes);

//For all the portfolio routes
app.use('/portfolio', portfolioRoutes);

app.get('/guide', (req, res) => {
    res.render('guide')
});

app.get('/contact', (req, res) => {
    res.render('contact')
});

app.post('/contact', catchAsync( async(req, res) => {
    const {firstName, lastName, email, subject, inquiry} = req.body;
    
    const text = "From: "+ firstName + " " + lastName + "\nMessage is:\n" + inquiry;
    await sendMail(email,subject,text, function (err,data) {
        //This code inside does not work for some reason
        if(err){
            req.flash('error', 'Your email was not sent, as an error occured.');
        } else {
            req.flash('success', 'Thank you for submitting an Inquiry, I will try to respond within 2-3 Working Days');
        }
    });
    req.flash('success', 'Thank you for submitting an Inquiry, if you gave a valid Email Address, you can expect a response within 2-3 Working Days');
    res.redirect('/portfolio');
}));

//ERROR HANDLERS
app.all('*', (req, res, next) => { //If someone goes to a path we didn't handle up there (and hence doesn't exist)
    // req.flash('error', '404, that Page Does not Exist');
    res.redirect('/portfolio')
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; //Deconstructing with default value
    if (!err.message) err.message = 'Oh No, Something Went Wrong!' //set the error message if the field was empty (there wasn't one)
    res.status(statusCode).render('error', { err }) //rendering an error template.
})

const port = process.env.PORT || 3000; //3000 will run in local development (since PORT doesn't exist in local .env file)
app.listen(port, () => {
    console.log("LISTENING ON PORT", port);
})

//Sort out the Form redirection, then do the .env file next with Key