const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,  //cloudnary
        required: true
    },
    coverImage: {
        type: String,  //cloudnary
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    }
}, 
    { timestamps: true }
)


userSchema.pre("save", async function(next) {
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 10);
    next()
})
// why use normal function not arrow function
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function() {
    console.log("USerModel :: Generating access token for user:", this._id);
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        },
    )
}

userSchema.methods.generateRefreshToken = function() {
    console.log("USerModel :: Generating refresh token for user:", this._id);
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    )
}

const User = mongoose.model('User', userSchema, 'UsersData')

module.exports= User