import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400, "video id is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Enter a valid api error")
    }
       
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1)*limitNum

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }
    
    const commentsData = await Comment.find({video: videoId})
    .skip(skip)
    .limit(limit)
    .populate("owner", "username avatar email")
    .sort({ createdAt: -1 })

    const totalComments = await Comment.countDocuments({ video: videoId })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                commentsData,
                totalComments,
                currentPage: pageNum,
                //totalPages: Math.ceil(totalComments/limitNum)
            },
            "fetched all the comments of the video successfully"
        )
    )



})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if(!videoId) {
        throw new ApiError(404, "video id not found")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Not a valid video id")
    }

    // if(!(content.trim() !== "" || content)){
    if(!content || content.trim() === ""){
        throw new ApiError(404, "please enter valid comment")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }


    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })
    // not need to save "await comment.save()" cuz .create() save automatically

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            comment,
            "comment added successfully"
        )
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { newContent } = req.body
    const { commentId } = req.params

    if(!commentId) {
        throw new ApiError(404, "comment id not found")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Not a valid comment id")
    }

    if(!newContent || newContent.trim() === ""){
        throw new ApiError(404, "updated new comment not found")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401, "you are not authorized to edit this comment")
    }

    comment.content = newContent
    await comment.save()
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                newComment : newContent 
            },
            "Comment updated successfully"
        )
    )
    
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if(!commentId){
        throw new ApiError(400, "enter comment id in params")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if(!req.user._id){
        throw new ApiError(404, "comment info not fetched")
    }
    console.log(req.user._id)

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"unautharized access for deleting a comment")
    }

    await Comment.findOneAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Comment is deleted by the owner"
        )
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }