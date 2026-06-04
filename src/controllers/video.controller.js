import mongoose, {isValidObjectId, Types} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    let { page, limit, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (!(userId)){
        throw new ApiError(400, "Fields are required")
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Enter a valid user id")
    }
    const user = await User.findById(userId) 
    
    if(!user){
        throw new ApiError(400, "User doesn't exist")
    }



    page = Number(req.query.page) || 1
    limit = Number(req.query.limit) || 10
    const skip = (page - 1)*limit

    // Filter videos by userId (owner) ==>make it clear<==
    const videoData = await Video.find().skip(skip).limit(limit).select("-isPublished")


    //const videoData = await apidata.select(select.split(",").join(" ")).skip(skip).limit(limit)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                videos: videoData,
                pageNumber: page
            },
            "Videos Data is serving successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title){
        throw new ApiError(404, "title and description both are required")
    }   
     
    // multer se path liya claudinary ko dene ke liye
    let videoPath
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoPath = req.files?.videoFile[0].path
    }

    let thumbnailPath
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailPath = req.files?.thumbnail[0].path
    }

    // link liye of uploaded video and thumbnails from cloudinary
    const videoLink = await uploadOnCloudinary(videoPath)
    const thumbnailLink = await uploadOnCloudinary(thumbnailPath)

    if(!(videoLink || thumbnailLink)){
        throw new ApiError(404, "video and thumbnail uploaded links on cloudinary are not found")
    }

    // Duration for the response given by the cloudinary
    const duration = videoLink.duration


    const video = await Video.create({
        videoFile: videoLink.url,           //.url used for the generated link
        thumbnail: thumbnailLink.url,
        title,
        description,
        duration,
        owner: req.user._id
    })
    await video.save()


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video uploaded Successfully"
        )
    )
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
// yahan ek problem h ki while updating we updating the all fields even if they are not provided so we create an object push changes inside that and then directly push that object, This solves are problem and we only update the required fields


    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body

    if(!(title || description)){
        throw new ApiError(400, "One of the field is required to be modified")
    } 

    if(!videoId){
        throw new ApiError(404, "video Id is required")
    }
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "video id does not exist")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "video not found in database")
    }

    // authenticated that only the owner can change the details
    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError (401, "You are not the the owner of the video")
    }

    const updatedFields = {}
    if(title !== undefined && title.trim() !== ""){
        updatedFields.title = title
    }
    if(description !== undefined && description.trim() !== ""){
        updatedFields.description = description
    } 
    
    // let newThumbnailPath
    // if(thumbnail){
    //     let thumbnailPath
    //     if(req.files && req.files.path){
    //         thumbnailPath = req.files.thumbnail[0].path
    //     }
    //     if(!thumbnailPath){
    //         throw new ApiError(404, " Path not found for thumbnail")
    //     }

    //     newThumbnailPath = await uploadOnCloudinary(thumbnailPath)

    //     if(!newThumbnailPath.url){
    //         throw new ApiError(404, "Url of thumbnail while updating is not found")
    //     }
    //     updatedFields.thumbnail = newThumbnailPath.url
    // }

    if(req.file && req.file.path){
        const thumbnailLocalPath = req.file.path
        
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if(!uploadedThumbnail || !uploadedThumbnail.url){
            throw new ApiError(500, "Failed to upload new thumbnail to Cloudinary")
        }
        
        updatedFields.thumbnail = uploadedThumbnail.url
    }
    


    const updates = await Video.findByIdAndUpdate(
        videoId,
        { $set: updatedFields},
        { new: true }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updates,
            "Fields updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400, "video id is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "video not found")
    }


    const video = await Video.findById(videoId)
    if (!video){
        throw new ApiError(400, "Video is not provided it's NULL")
    }
    //check the owner before the deleting

    if(req.user?._id.toString() !== video.owner.toString()){
        throw new ApiError(400, "You are not Autharized to delete the file")
    }
    await video.deleteOne()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Video is deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(404, "videoId is required")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Please enter valid video id")
    }
    const video = await Video.findById(videoId)

    if(!video){         // video == null
        throw new ApiError(404, " video not exist")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                isPublished: video.isPublished,
                videoId: video._id

            },
            "Video ispublished or not found successfully"
        )
    )
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