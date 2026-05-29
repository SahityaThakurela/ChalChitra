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

        // by giving false validation is not running in the db before saving because there is no need to verify the password again and again while saving the refresh token into db, we've already did it before this process 

        return { accessToken, refreshToken }    //returning the object 

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
    const existedUser = await User.findOne({     // findone stop when it finds first match

    // "User" call mongoose functions like findone,create,etc 
    // "user" || "any_instance_name_you_passed" can can methods you've created like in bcrypt/auth..

        $or: [{ username }, { email }]     
        //or is a mongodb operator we passes a array []
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

const logoutUser = asyncHandler(async(req, res) => {   
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

export {
    registerUser,
    loginUser,
    logoutUser
}