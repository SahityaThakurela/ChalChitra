import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!videoId) {
        throw new ApiError(400, "please enter a video id")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "please enter a valid video id")
    }


    // //auth 
    // if(req.user?._id.toString() !== Like.likeBy.toString()){
    //     throw new ApiError(403, "not authorized to like or unlike")
    // }


    //cheaking if user already liked or not
    const like = await Like.findOne({
        // video: videoId,
        video: { $exists: true, $ne: null}, // exits and should not be null
        likeBy: req.user?._id
    })

    if (like) {
        // const unLike = await Like.deleteOne({ likeBy: req.user._id })     // not a good way to do cuz no specific video is deleting 

        const unLike = await Like.findByIdAndDelete(like._id)   // great way

        if(!unLike){
            throw new ApiError(400, "unLike doesn't work")
        }

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
        const like = await Like.create({
            video: videoId,
            likeBy: req.user?._id
        })

        if(!like){
            throw new ApiError(400, "Like doesn't work")
        }

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
        throw new ApiError(400, "please enter a comment id")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "please enter a valid comment id")
    }

    // cheaking if user already liked or not
    const comment = await Comment.findOne({
        comment: commentId,
        likeBy: req.user?._id
    })

    if (comment) {
        await Comment.deleteOne({ _id: Comment._id })     // delete specific comment

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

    if (!tweetId) {
        throw new ApiError(400, "please enter a tweet id")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "please enter a valid tweet id")
    }

    //cheaking if user already liked or not
    const tweet = await Tweet.findOne({
        tweet: tweetId,
        likeBy: req.user?._id
    })

    if (tweet) {
        await Tweet.deleteOne({ _id: Tweet._id })     // delete specific comment

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {isTweetLiked: false},
                "Tweet unliked successfully"
            )
        )
    } else {
        await Tweet.create({
            tweet: tweetId,
            likeBy: req.user?._id
        })

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {isTweetLiked: true},
                "tweet liked successfully"
            )
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // const { userId } = req.params
    const { page = 1, limit = 10 } = req.query    // take this in query not in body

    // if (!userId) {
    //     throw new ApiError(400, "User ID is required")
    // }

    // if (!isValidObjectId(userId)) {
    //     throw new ApiError(400, "Invalid user ID format")
    // }

    // if(req.user._id.toString() !== Like.likeBy.toString()){
    //     throw new ApiError("you are not autharized to see this user watched history")
    // }

    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    const skip = (pageNum - 1)*limitNum



    const likedVideos = await Like
    .find({ 
        // _id: req.user._id,           // fix
        likeBy: req.user._id,
        video: { $exists: true }        // only liked videos not the comments and tweets
    })
    .populate("video", "title description thumbnail duration owner")    // sending related data 
    .sort({ createdAt: -1 })    // latest first
    .skip(skip)
    .limit(limitNum)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                // userId,
                currentPage: pageNum, // send this in res while pagination
                totalLikedVideos: likedVideos.length,
                likedVideos
            },
            // "fetched all the liked videos data by user"
            likedVideos === 0? "No liked videos found": "liked videos fetched successfully"
        )
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}