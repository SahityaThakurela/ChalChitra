import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async(userid) => {
    try {
        const user = await User.findById(userid)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({   validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refreshing token")
    }
}

const registerUser = asyncHandler (async (req, res) => {
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
    const {fullName, email, username, password} = req.body      // req.body is default given by express
    // console.log("email", email);


    // validation - not empty
    if  (
            [fullName, email, username, password].some((field) => 
                field?.trim() === "")
        ){
            throw new ApiError(400, "All fields are required")
        }
    

    // check if user already exists: username, email
    const existedUser = await User.findOne({     // find one stop when it finds the //User can talk to DB directly
        $or: [{ username }, { email }]     //or is a operator 
    })
    if(existedUser){
        throw new ApiError(409, "User with same email and username already exist")
    }


    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //better way to check coverImageLocalPath so that when there is nothing empty string output and no error should come 
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }


    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar){
        throw new ApiError(400, "Avatar is required")
    }


    // create user object - create entry in db
    const user = await User.create({
        fullName,                       // in js fullName, -> fullName = fullName
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })


    // remove password and refresh token field from response
    // check for user creation
    const createdUser = await User.findById(user._id).select(   // this select feature work little diff 
        //this ._id is created automatically everytimes entry happens
        "-password -refreshToken"                               // -fields not selected 
    )
    if(!createdUser) {
        throw new ApiError(500, "Something is wrong while registering the user")
    }


    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser,"User is Registered Successfully")
    )
})


const loginUser = asyncHandler (async (req, res) => {
    //req.body -> data
    //username or email
    //find the user
    //password
    //access and refresh token
    //send cookie

    const {username, email, password} = req.body
    if (!email && !username) {
        throw new ApiError(400, "Username or email is required")
    }
    

    const user = await User.findOne({
        $or: [
            { username: username?.toLowerCase() },
            { email: email?.toLowerCase() }
        ]
    })

    if(!user){
        throw new ApiError(404, "user not found")
    }
    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid){
        throw new ApiError(401, "incorrect password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const logedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,     // only modified by the server
        secure: true        // ,,
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

const logoutUser = asyncHandler(async(req, res) => {   
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,     
        secure: true        
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"))

})

export {
    registerUser,
    loginUser,
    logoutUser
}