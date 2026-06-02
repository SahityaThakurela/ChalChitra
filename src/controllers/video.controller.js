import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const { page = 1, limit = 5, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (!(userId)){
        throw new ApiError(400, "Fields are required")
    }
    page = Number(req.query.page)
    limit = Number(req.query.limit)

    const skip = (page - 1)*limit

    let selectitem = select.split(",").join(" ")
    apidata = apidata.select(selectitem)
    const videoData = await apidata.skip(skip).limit(limit)

    //const videoData = await apidata.select(select.split(",").join(" ")).skip(skip).limit(limit)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videoData,
            "Videos Data is serving successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const requestedVideoId = isValidObjectId(videoId)
    if(!requestedVideoId){
        throw new ApiError(400, "Video ID not found")
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(401, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video is fetched successfully"
        )
    )



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

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}




















































// import mongoose, {isValidObjectId} from "mongoose"
// import {Video} from "../models/video.model.js"
// import {User} from "../models/user.model.js"
// import {ApiError} from "../utils/ApiError.js"
// import {ApiResponse} from "../utils/ApiResponse.js"
// import {asyncHandler} from "../utils/asyncHandler.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"


// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination
// })

// const publishAVideo = asyncHandler(async (req, res) => {
//     const { title, description} = req.body
//     // TODO: get video, upload to cloudinary, create video
// })

// const getVideoById = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: get video by id
// })

// const updateVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: update video details like title, description, thumbnail

// })

// const deleteVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: delete video
// })

// const togglePublishStatus = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
// })

// export {
//     getAllVideos,
//     publishAVideo,
//     getVideoById,
//     updateVideo,
//     deleteVideo,
//     togglePublishStatus
// }