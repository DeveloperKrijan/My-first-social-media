const mongoose = require('mongoose');
const { none } = require('../config/multerconfig');

let postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: String,
    photos: [{
        type: [String],
        default : []
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }]
});

let postModel = mongoose.model('post', postSchema);

module.exports = {
    postModel
}