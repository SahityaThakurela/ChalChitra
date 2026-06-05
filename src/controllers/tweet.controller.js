import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { tweet } = req.body
    
    if(!tweet || tweet.trim() === ""){
        throw new ApiError(400, "please a enter something in tweet")
    }

    const tweets = await Tweet.create({
        content: tweet,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            201, 
            tweets,
            "tweet has posted successfully"
        )
    )
})

// koi bhi kisi ki id se uske saare tweets dekh skta h lekin idher which is okay as of know 
const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if(!userId){
        throw new ApiError(400, "Please Enter the user id in url")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Enter a valid user id")
    }

    const Tweets = await Tweet.find({ owner: userId })

    // .find() always return an array [] so !tweet never null instead of that check the length
    if(Tweets.length === 0){
        throw new ApiError(404, "Tweets not found")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                owner : userId,
                allTweets: Tweets
            },
            "all tweets by the user sereved successfully"
        )
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if(!tweetId){
        throw new ApiError(400,"Enter a tweet id")
    }
    
    // for req.body check for !content.trim() === "" not !content because it never be null 
    if(content.trim() === ""){
        throw new ApiError(400, "Please make some changes in existing comment")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Enter a valid tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "Unable to find the tweet")
    }

    // validating the user is autharized to edit the tweet or not 
    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "you are not autharized to edit this tweet")
    }

    tweet.content = content.trim()
    await tweet.save()

    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            // content, return full tweet
            tweet,
            "Tweet is edited successfully"
        )
    )
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

     if(!tweetId){
        throw new ApiError(400,"Enter a tweet id")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Enter a valid tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "Unable to find the tweet")
    }

    // validating the user is autharized to delete the tweet or not 
    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "you are not autharized to delete this tweet")
    }

    //await Tweet.findByIdAndDelete(tweetId)

    await tweet.deleteOne()

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "tweet is deleted successfully"
        )
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}