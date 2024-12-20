const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js')
const asyncHandler = require('../utils/asyncHandler.js')
const User = require('../models/userModel.js')
const {uploadOnCloudinary, deleteImage} = require('../utils/cloudinary.js')
const jwt = require("jsonwebtoken");
const { default: mongoose } = require('mongoose');



const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}
   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating access and refresh token")
   }
}


const registerUser = asyncHandler ( async (req, res) => {
   //get user details from forntend
   //validation - not empty
   //check if user already exists: username, email
   //check for image, check for avatar
   //upload them to cloudinary
   //create user object - create entry in db
   //remove password and refreshtoken field from Response
   //check for user creation
   //return res

   const { username, email, fullName, password } = req.body;
   console.log("\nEmail: ", email, "\nUsername: ", username, "\nfullName: ", fullName);
   console.log("\nreq.body: ", req.body)

//    if(fullName == "") throw new ApiError(400, "Fullname required...!")
//    if(username == "") throw new ApiError(400, "username required...!")

   if( [ fullName, username, email, password].some((fields) => fields?.trim() === "" ) ) {
        throw new ApiError(400, "All Fields are Required...!")
   }
   
   const existedUser = await User.findOne({
    $or: [{ username }, { email }]
   })

   if(existedUser) {
    throw new ApiError(409, "User with email or username already exists...!")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;
   
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
   }
   console.log("\nreq.files: ", req.files, "\nreq.files.avatar: ", req.files.avatar)

   if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   }
   console.log("\navatarLocalPath: ", avatarLocalPath)
   
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   
   if(!avatar) {
      throw new ApiError(400, "Avatar file is required")
   }

   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if(!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
   )
})


const loginUser = asyncHandler ( async (req, res) => {
   //1. get data req.body
   //2. check for username or email
   //3. find the user in our db
   //4. password check
   //5. generate access and refresh token
   //6. send cookie

   const { email, username, password } = req.body;

   if(!username || !email) {
      throw new ApiError(404, "username or email is required")
   }

   const user = await User.findOne({
      $or: [{username}, {email}]
   })

   if(!user) {
      throw new ApiError(404, "user does not exist")
   }
   console.log("\nUser frrom login controller : ", user);
   

   const isPasswordValid = await user.isPasswordCorrect(password)
   console.log("\nisPasswordValid : ", isPasswordValid);
   

   if(!isPasswordValid) {
      throw new ApiError(401, "Invalid Password")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
   console.log("\n accessToken : ", accessToken);
   console.log("\n refreshToken : ", refreshToken);
   

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   console.log("\nloggedInUSre : ", loggedInUser);
   

   const options = {
      httpOnly: true,
      secure: true
   }

   res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(new ApiResponse(200,
      {
         user: loggedInUser, accessToken, refreshToken
      },
      "User logged in successfully"
   ))
   
})


const logoutUser = asyncHandler(async (req, res) => {
   console.log("Logging out user ID:", req.user._id);
   const updatedUSer = await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset: {
            refreshToken: 1
         }
      },
      {
         new: true
      }
   )
   console.log("User after logout:", updatedUSer)
   
   const options = {
      httpOnly: true,
      secure: true
   }

   return res.status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User Logged Out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request")
   }

   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      )
   
      const user = await User.findById(decodedToken?._id)
   
      if(!user) {
         throw new ApiError(401, "Invalid refresh token")
      }
   
      if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "refresh token is expired or used")
      }
   
      const options = {
         httpOnly: true,
         secure: true
      }
   
      const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
   
      return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken,options)
      .json(
         new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
         )
      )
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
   }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
   const {oldPassword, newPassword} = req.body  // we can do confirm above password as well in backend or can be in frontend

   // const {oldPassword, newPassword, confPassword} = req.body
   // if(newPassword !== confPassword) {
   //    throw new ApiError(400, "password confimation wrong")
   // }

   const user = await User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password")
   }

   user.password = newPassword
   user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
   return res
   .status(200)
   .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})


const updateAccountDetails = asyncHandler(async (req, res) => {
   const {fullName, email} = req.body

   if(!fullName || !email) {
      throw new ApiError(400, "all fields are required")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullName,
            email
         }
      },
      {
         new: true
      }
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, user, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
   }

   const userRecord = await User.findById(req.user?._id).select("avatar");
   const oldAvatarUrl = userRecord?.avatar;

   if(!oldAvatarUrl) {
      throw new ApiError(400, "Old avatar is missing");
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url) {
      throw new ApiError(400, "Error while uploading avatar")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      {
         new: true
      }
   )
   
   const deleteOldAvatarResult = await deleteImage(oldAvatarUrl);
   console.log("Result of delete Old Image :: ",deleteOldAvatarResult);
   

   if(!deleteOldAvatarResult) {
      throw new ApiError(400, "Error while deleting old avatar")
   }

   return res
   .status(200)
   .json(new ApiResponse(200, user, "avatar updated successfully"))
})



const updateUserCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path

   if(!coverImageLocalPath) {
      throw new ApiError(400, "Cover Image file is missing")
   }

   const userRecord = await User.findById(req.user?._id).select("coverImage");
   const oldCoverImageUrl = userRecord?.coverImage;

   if(!oldCoverImageUrl) {
      throw new ApiError(400, "Old coverImage is missing");
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage.url) {
      throw new ApiError(400, "Error while uploading Cover Image")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      {
         new: true
      }
   )

   const deleteOldCoverImageResult = await deleteImage(oldCoverImageUrl);
   console.log("Result of delete Old Image :: ",deleteOldCoverImageResult);
   

   if(!deleteOldCoverImageResult) {
      throw new ApiError(400, "Error while deleting old coverimage")
   }

   return res
   .status(200)
   .json(new ApiResponse(200, user, "cover image updated successfully"))
})


const getUserChannelProfile = asyncHandler(async (req, res) => {
   const {username} = req.params

   if(!username?.trim()) {
      throw new ApiError(400, "username is missing")
   }

   const channel = await User.aggregate([
      {
         $match: {
            username: username?.toLowerCase()
         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
         }
      },
      {
         $addFields: {
            subscribersCount: {
               $size: "$subscribers"    // as: "subscribers"
            },
            channelsSubscribedToCount: {
               $size: "$subscribedTo"     // as: "subscribedTo"
            },
            isSubscribed: {
               $cond: {
                  if: {
                     $in: [req.user?._id, "$subscribers.subscriber"]
                  },
                  then: true,
                  else: false
               }
            }
         }
      },
      {
         $project: {
            username: 1,
            fullName: 1,
            email: 1,
            avatar: 1,
            coverImage: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1
         }
      }
   ])

   console.log("\nLogging Channel Pipeline :: ", channel)

   if(!channel?.length) {
      throw new ApiError(404, "channel does not exists")
   }

   return res
   .status(200)
   .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})


const getWatchHistory = asyncHandler(async (req, res) => {
   const user = await User.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
         $lookup: {
            from: 'videos',
            localField: 'watchHistory',
            foreignField: '_id',
            as: 'watchHistory',
            pipeline: [
               {
                  $lookup: {
                     from: 'users',
                     localField: 'owner',
                     foreignField: '_id',
                     as: 'owner',
                     pipeline: [
                        {
                           $project: {
                              fullName: 1,
                              username: 1,
                              avatar: 1
                           }
                        }
                     ]
                  }
               },
               {
                  $addFields: {
                     owner: {
                        $first : "$owner"
                     }
                  }
               }
            ]
         }
      }
   ])


   return res
   .status(200)
   .json( new ApiResponse(200, user[0].watchHistory, "watch history fetched successfully"))
})

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}