const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    black: String,
    white: String,
    blackRank: String,
    whiteRank: String,
    result: String,
    date: String,
    location: String,
    gameName: String,
    SGF: String,
    owner: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
        
    ]
},{ timestamps: true });

GameSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Game', GameSchema);