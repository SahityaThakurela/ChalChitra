import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"



export const verifyJWT = asyncHandler(async(req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET ) 
    
        const user = await User.findById(decodedToken?._id).select
        ("-password -refreshToken")
    
        if(!user){
            //discussion
            throw new ApiError (401, "Invaled access token")
        }

        // After the JWT is verified and the user is found, you need to pass this user information to the next route handler
        // Instead of querying the database again, you store it in req.user.

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }

})