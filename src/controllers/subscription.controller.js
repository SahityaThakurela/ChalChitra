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
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}