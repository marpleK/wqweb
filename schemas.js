const BaseJoi = require('joi');
const { number } = require('joi');
const sanitizeHtml = require('sanitize-html');
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.gameSchema = Joi.object({
    game: Joi.object({
        Black: Joi.string().required().escapeHTML(),
        White: Joi.string().required().escapeHTML(),
        BlackRank: Joi.string().required().escapeHTML(),
        WhiteRank: Joi.string().required().escapeHTML(),
        Result: Joi.string().required().escapeHTML(),
        Date: Joi.string().required().escapeHTML(),
        Location: Joi.string().required().escapeHTML(),
        Competition: Joi.string().required().escapeHTML(),
        SGF: Joi.string().required().escapeHTML(),
        owner: Joi.string().required().escapeHTML(),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

