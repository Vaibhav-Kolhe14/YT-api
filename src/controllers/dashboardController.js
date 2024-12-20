const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js')
const asyncHandler = require('../utils/asyncHandler.js')
const mongoose = require("mongoose")
const Video = require("../models/videoModel.js")
const Like = require("../models/likesModel.js")
const Subscription = require("../models/subscriptionModel.js")


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

module.exports = {
    getChannelStats, 
    getChannelVideos
}