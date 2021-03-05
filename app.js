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

const userRoutes = require('./routes/users');
const portfolioRoutes = require('./routes/portfolio');
const catchAsync = require("./utils/catchAsync");

/*COMMANDS:
1. Press CTRL+D while selecting something to select another one, and keep
pressing to eventualy select all.
2. Presss SHIFT+ALT+DOWNARROWKEY to duplicate a line below
3. Press ALT and highlight things to highlight multiple things at once
*/

//Connecting to Mongoose Database
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

//Setting up session config
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',/*Eventually will be an actual secret
    in production*/
    resave: false,
    saveUninitialized: true,
    cookie: { //configuring the cookie
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
    //store : *Eventually we will make the store a mongo store*
}
//Setting up session with the sessionConfig
app.use(session(sessionConfig))
//Setting up Flash
app.use(flash()); 

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
    console.log('Data: ', req.body);
    const {firstName, lastName, email, subject, inquiry} = req.body;
    
    const text = "From: "+ firstName + " " + lastName + "\nMessage is:\n" + inquiry;
    await sendMail(email,subject,text, function (err,data) {
        //This code inside does not work for some reason
        if(err){
            console.log("Email was not sent")
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
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; //Deconstructing with default value
    if (!err.message) err.message = 'Oh No, Something Went Wrong!' //set the error message if the field was empty (there wasn't one)
    res.status(statusCode).render('error', { err }) //rendering an error template.
})

app.listen(3005, () => {
    console.log("LISTENING ON PORT 3005");
})

//Sort out the Form redirection, then do the .env file next with Key