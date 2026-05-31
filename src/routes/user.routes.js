import { Router } from "express";
import {    loginUser, 
            registerUser, 
            logoutUser, 
            refreshAccessToken, 
            changePassword, 
            getCurrentUser, 
            updateAccountDetails, 
            updateUserAvatar, 
            updateUserCover, 
            getUserChannelProfile, 
            getUserHistory 
    } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secured Routes -> need to verify the auth by middleware like verifyJWT here
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("change-password").post(verifyJWT, changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
// patch for selected updates post update all the fields
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails) 
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) //doubt
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCover)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/user-history").get(verifyJWT, getUserHistory)

export default router


