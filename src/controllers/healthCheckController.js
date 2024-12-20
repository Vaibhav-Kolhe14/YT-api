const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js')
const asyncHandler = require('../utils/asyncHandler.js')

const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
})

module.exports = {
    healthcheck
}
    