import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params  //channel id is basically a user id
    // TODO: toggle subscription
    if(!channelId){
        throw new ApiError(400, "please enter channel id")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "enter valid channel id")
    }

    if(channelId.toString() === req.user?._id.toString()){
        throw new ApiError(400, "You can't like your own channel")
    }
    
    const subscribed = await Subscription.findOne({ 
        channel: channelId,
        subscriber: req.user?._id
    })
    

    if(!subscribed){
        const isSubscribed = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })

        if (!isSubscribed) {
        throw new ApiError(500, "Something went wrong while subscribing");
    }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isSubscribed: true },
                "Channel get subscribed successfully"
            )
        )
    }else{
        const isSubscribed = await Subscription.findOneAndDelete({ 
            subscriber: req.user?._id,
            channel: channelId
        })

        if (!isSubscribed) {
        throw new ApiError(500, "Something went wrong while unSubscribing");
    }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isSubscibed: false },
                "Channel get unSubscribed successfully"
            )
        )
    }

})

// controller to return subscriber list of a channel
// 
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400, "please enter channel id")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "enter a valid channel id")
    }

    // const channel = await Subscription.findOne({ channel: channelId })

    // if(!channel){
    //     throw new ApiError(404, "channel not found")
    // }

    const listOfChannelSubs = await Subscription.find({ channel: channelId })

    if(!listOfChannelSubs){
        throw new ApiError(404, "unable to find list of channel's subscribers")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            listOfChannelSubs,
            "list of channel subscribers fetched successfully"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(400, "please enter subscriber id")
    }

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "enter a valid subscriber id")
    }


    const subscriber = await Subscription.find({ subscriber: subscriberId })

    if(!subscriber){
        throw new ApiError(404, "unable to find list of subscribers of user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscriber,
            "list of subscribers of user fetched successfully"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}