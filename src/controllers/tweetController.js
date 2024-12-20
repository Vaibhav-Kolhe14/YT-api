const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js')
const asyncHandler = require('../utils/asyncHandler.js')
const mongoose = require("mongoose"); 
const { isValidObjectId } = mongoose; 
const User = require('../models/userModel.js')
const Tweet = require("../models/tweetModel.js")



const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}