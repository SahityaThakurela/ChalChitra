import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { useId } from "react"


// // $push - Add element to array
// { $push: { videos: "vid4" } }

// // $pull - Remove element from array
// { $pull: { videos: "vid4" } }

// // $set - Update fields
// { $set: { name: "New Name" } }

// // $addToSet - Add if not exists (no duplicates)
// { $addToSet: { videos: "vid4" } }


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name || !description || name.trim() === "" || description.trim() === ""){
        throw new ApiError(400, "please enter title and description to the playlist")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            playlist,
            "playlist created successfully"
        )
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(400,"please enter a user Id")
    }

    // anyone has the userid can access the list of the playlist he/she has created
    const playlist = await Playlist.find({ owner: userId })
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "successfully fetched all the playlist created by the user"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId){
        throw new ApiError(400,"please enter a videoid")
    }
    
    if (!isValidObjectId(playlistId)){
        throw new ApiError(400, "please enter a valid video id")
    }

    const playlist = await Playlist.findOne({ _id: playlistId })

    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist fetched successfully"
        )
    )
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    // adding a video to specific playlist
    if(!videoId){
        throw new ApiError(400,"please enter a videoid")
    }
    
    if (!isValidObjectId(videoId)){
        throw new ApiError(400, "please enter a valid video id")
    }

    if(!playlistId){
        throw new ApiError(400,"please enter a videoid")
    }
    
    if (!isValidObjectId(playlistId)){
        throw new ApiError(400, "please enter a valid video id")
    }

    //anyone has the id of playlist can add the videos inside that
    // const playlist = await Playlist.findById(playlistId)

    // if(!playlist){
    //     throw new ApiError(404, "playlist not found")
    // }
    // approch:1 create and object and merge the only changes inside model BUT, 
    // const playlistChanges= {}
    // playlistChanges.videos = videoId

    // approch: 2 -> using push operator $push:{} to push the videoId inside the videos section

    const update = await Playlist.findByIdAndUpdate(
        { _id: playlistId },
        { $push: {videos: videoId } },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            update,
            "Video is added to the playlist"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!videoId){
        throw new ApiError(400,"please enter a videoid")
    }
    
    if (!isValidObjectId(videoId)){
        throw new ApiError(400, "please enter a valid video id")
    }

    if(!playlistId){
        throw new ApiError(400,"please enter a videoid")
    }
    
    if (!isValidObjectId(playlistId)){
        throw new ApiError(400, "please enter a valid video id")
    }

    // anyone has playistId can make all changes, but can demand userId then check tha validity by owner in future for know lets it be

    // const playlist = await Playlist.findById(playlistId)

    // if(!playlist){
    //     throw new ApiError(404,"unable to find the playlist")
    // }

    const playlist = await Playlist.findById(
        {_id: playlistId},
        {$pull: { videos: videoId }},
        {new: true}
    )

    // for (let i = 0; i < playlist.videos.length; i++) {
    //     if(playlist.videos[i].toString() === videoId.toString()){
    //         // if only one video we can break the loop

    //     }
            
    // }
    // await Playlist.findOne({ videos: videoId })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video is removed from the playlist"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!playlistId){
        throw new ApiError(400,"please enter a videoid")
    }
    
    if (!isValidObjectId(playlistId)){
        throw new ApiError(400, "please enter a valid video id")
    }

    await Playlist.findByIdAndDelete({ _id: playlistId })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "playlist is removed from the user db"
        )
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId){
        throw new ApiError(400,"please enter a playlistId")
    }
    
    if (!isValidObjectId(playlistId)){
        throw new ApiError(400, "please enter a valid playlist Id")
    }

    if(name.trim() === "" && description.trim() === ""){
        throw new ApiError(400, "please edit name or description")
    }

    const playlistCh = await Playlist.findById(playlistId)

    if (playlistCh.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist")
}
    
    if(!playlistCh){
        throw new ApiError(404, "palylist not found")
    }

    const updatedFields = {}
    // if(name.trim() !== "" && description.trim() !== ""){
    //     updatedFields.name = name
    //     updatedFields.description = description
    // }else if(name.trim() !== "" || description.trim() !== ""){
    //     if(sdf){

    //     }
    // }


    
    if(name.trim() !== ""){
        updatedFields.name = name.trim()
    }
    if(description.trim()!== ""){
        updatedFields.description = description.trim()
    }
    
    const playlist = await Playlist.findByIdAndUpdate(
        {_id: playlistId},
        {$set: updatedFields},
        {new: true}
    )

    if(!playlist){
        throw new ApiError(404, "something went wrong no updated playlist found")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                playlistId,
                playlist
            },
            "Playlist fields updated successfully"
        )
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}