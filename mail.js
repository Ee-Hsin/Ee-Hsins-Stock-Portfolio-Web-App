if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: process.env.MAILGUN, //from .env file
        domain: process.env.MAILGUN_DOMAIN
    }
}


const transporter = nodemailer.createTransport(mailGun(auth));

const sendMail = (email,subject,text, callBack) => {
    const mailOptions = {
        from: email,
        to: 'eehsinkok777@gmail.com',
        subject: subject,
        text: text
    }
    
    transporter.sendMail(mailOptions, function (err,data){
        if (err){
            callBack(err,null);
        } else{
            callBack(null,data);
        }
    })
}

module.exports = sendMail;