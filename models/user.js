const mongoose = require('mongoose');
const { none } = require('../config/multerconfig');

const connectdb = async function () {
    await mongoose.connect('mongodb+srv://krijan:823gGdFV6CiqOGlx@my-first-db.7shkhmk.mongodb.net/fb-project')
    console.log("Db connected 🐱‍🏍");
}

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
        required: true,
    },
    age: {
        type: Number,
        minlength: 0,
        default: 0
    },
    email: {
        type: String,
        required: true,
        unique : true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },

    profilepic : {
        type : String,
        default : "defult.png"
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    }]
});

let userModel = mongoose.model('user', userSchema);

module.exports = {
    connectdb,
    userModel
}
