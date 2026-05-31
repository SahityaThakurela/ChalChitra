import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshTokens = async (userid) => {
    try {
        const user = await User.findById(userid)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        // by giving false validation is not running in the db before saving because there is no need to verify the password again and again while saving the refresh token into db, we've already did it before this process 

        return { accessToken, refreshToken }    //returning the object 

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refreshing token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res



    // get user details from frontend
    const { fullName, email, username, password } = req.body      // req.body is default given by express
    // console.log("email", email);


    // validation - not empty
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    // check if user already exists: username, email
    const existedUser = await User.findOne({     // findone stop when it finds first match

        // "User" call mongoose functions like findone,create,etc 
        // "user" || "any_instance_name_you_passed" can can methods you've created like in bcrypt/auth..

        $or: [{ username }, { email }]
        //or is a mongodb operator we passes a array []
    })
    if (existedUser) {
        throw new ApiError(409, "User with same email and username already exist")
    }


    // check for images, check for avatar
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    //better way to check coverImageLocalPath so that when there is nothing empty string output and no error should come 
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }


    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }


    // create user object - create entry in db
    const user = await User.create({
        fullName,                       // in js fullName, -> fullName : fullName
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })


    // remove password and refresh token field from response
    // check for user creation
    const createdUser = await User.findById(user._id).select(   // this select feature work little diff 
        "-password -refreshToken"
    )
    // "-password -refreshToken" these selected fields will not send to the client/user side 
    // this ._id is created automatically everytimes entry happens

    if (!createdUser) {
        throw new ApiError(500, "Something is wrong while registering the user")
    }


    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User is Registered Successfully")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    //req.body -> data
    //username or email
    //find the user
    //password
    //access and refresh token
    //send cookie

    const { username, email, password } = req.body
    if (!email && !username) {
        throw new ApiError(400, "Username or email is required")
    }


    const user = await User.findOne({
        $or: [
            { username: username?.toLowerCase() },
            { email: email?.toLowerCase() }
        ]
    })

    if (!user) {
        throw new ApiError(404, "user not found")
    }



    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "incorrect password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const logedInUser = await User.findById(user._id).
        select("-password -refreshToken")

    // By using options, cookies are only be modified by the server side, user can only view
    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: logedInUser, accessToken, refreshToken
                },
                "User loggedIn successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
                // Prevent token reuse - If someone steals the token, they can't use it to get a new access token

            }
        },
        {
            new: true       // Returns the updated user document
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)       //clearCookie is a method inside cookieparser to clear the cookies
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw ApiError(401, "unautharized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw ApiError(401, "Token is Expired or used")
        }


        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)



        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { refreshToken: newrefreshToken, accessToken },
                    "Access Token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }

})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    if (newPassword !== confirmPassword) {
        throw ApiError(401, "password didn't matched")
    }

    if (!(oldPassword && newPassword && confirmPassword)) {
        throw ApiError(402, "Please Enter the values")
    }

    const user = await User.findOne(req.user?._id)
    const isPasswordCorrect = await isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw ApiError(400, "Incorrect password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Change successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current User fatched Successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!(fullName || email)) {
        throw new ApiError(400, "all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account Details update successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw ApiError(400, "Error while uploading on cloud")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))

})

const updateUserCover = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path

    if (!coverLocalPath) {
        throw ApiError(400, "Cover image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath)

    if (!coverImage.url) {
        throw ApiError(400, "Error while uploading on cloud")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"))

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username) {
        throw ApiError(401, "username not found in params")
    }

    // User.aggregate([{},{},{}])

    const channel = await User.aggregate([
        // this pipeline find the perticular user for further operations
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        // lookup is a MongoDB aggregation operator that joins data from two collections & output is an array
        {
            $lookup: {
                from: "subscriptions",          // here make subscriptions from Subscription 
                localField: "_id",
                foreignField: "channel",        // Why channel ??? -->MUST KNOW<-- REF: 19th Video
                as: "subscribers"               // output main array deta hai
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",     // Why channel ??? -->MUST KNOW<-- REF: 19th Video
                as: "subcribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsCount: {
                    $size: "$subcribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                subscribersCount: 1,
                channelsCount: 1,
                isSubscribed: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,


            }
        }
    ])

    console.log(channel)

    if (!channel?.length) {
        throw new ApiError(200, "Channel not exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User Channel fetch successfully"))
})

const getUserHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                // _id: req.user._id
                // req.user._id it's a string so initialy we're using it directly cuz mongoose directly fetch that, But, in aggregation piplines core mongodb works not mongoose so we need to write in this way 
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },

        // nested pipeline ka case h 
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    },
                    {
                        // response m array ki jagah object send krenge by this so that ki loop na run kren
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,   // user object send kr raha h
            "watch History fetched Successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCover,
    getUserChannelProfile,
    getUserHistory
}