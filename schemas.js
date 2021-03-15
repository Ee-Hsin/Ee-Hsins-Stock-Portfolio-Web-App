const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(), //define extension on joi.string()
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: { //extension is called escapeHTML
            validate(value, helpers) { //needs a function called validate, which JOI will call automatically.
                const clean = sanitizeHtml(value, {
                    allowedTags: [], //empty array (meaning NO allowed tags)
                    allowedAttributes: {}, //empty object (meaning NO allowed attributes)
                });
                //clean must be equal to initial value or we call error.
                if (clean !== value) return helpers.error('string.escapeHTML', { value }) 
                //everything passes, so can return the clean.
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension) //to enable the extension (adds it on to base version of JOI).

module.exports.stockSchema = Joi.object({
    stock: Joi.object({
        name: Joi.string().required().escapeHTML(), //title has to be a string and is required
        ticker: Joi.string().required().escapeHTML(), 
        price: Joi.number().required(),
        units: Joi.number().required(),
        IV: Joi.string().escapeHTML(),
        category: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array(),
});
