const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js')
const asyncHandler = require('../utils/asyncHandler.js')
const mongoose = require("mongoose"); 
const { isValidObjectId } = mongoose; 
const {uploadOnCloudinary, deleteImage} = require('../utils/cloudinary.js')
const User = require('../models/userModel.js')
const Video = require("../models/videoModel.js")

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

module.exports = {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}