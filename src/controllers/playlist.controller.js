import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist

    if(name.trim() === "" && description.trim() === ""){
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
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
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

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    // const playlistChanges= {}
    // playlistChanges.videos = videoId

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

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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