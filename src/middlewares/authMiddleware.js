const User = require("../models/userModel.js") 
const ApiError = require("../utils/ApiError.js")
const asyncHandler = require("../utils/asyncHandler.js")
const jwt = require('jsonwebtoken')

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log("\ntoken from middleware : ", token);
        
    
        if(!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("\ndecodedData from middleare : ", decodedData);
        
    
        const user = await User.findById(decodedData?._id).select("-password -refreshToken")
    
        if(!user) {
            //imp about frontend
            throw new ApiError(401, "Invalid access token")
        }
        console.log("\nuser from middleware : ", user);
        
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token :: authMiddleware")
    }
})

module.exports = { verifyJWT }