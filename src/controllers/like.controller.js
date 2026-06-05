import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!videoId) {
        throw new ApiError(400, "please enter a video id")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "please enter a valid video id")
    }

    //cheaking if user already liked or not
    const like = await Like.findOne({
        video: videoId,
        likeBy: req.user?._id
    })

    if (like) {
        await Like.deleteOne({ _id: Like._id })     // delete specific like

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {isLiked: false},
                "Video unliked successfully"
            )
        )
    } else {
        await Like.create({
            video: videoId,
            likeBy: req.user?._id
        })

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {isLiked: true},
                "Video liked successfully"
            )
        )
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!commentId) {
        throw new ApiError(400, "please enter a video id")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "please enter a valid video id")
    }

    //cheaking if user already liked or not
    const comment = await Comment.findOne({
        comment: commentId,
        likeBy: req.user?._id
    })

    if (comment) {
        await Comment.deleteOne({ _id: Like._id })     // delete specific comment

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {isCommentLiked: false},
                "comment unliked successfully"
            )
        )
    } else {
        await Comment.create({
            comment: commentId,
            likeBy: req.user?._id
        })

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {isCommentLiked: true},
                "comment liked successfully"
            )
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}