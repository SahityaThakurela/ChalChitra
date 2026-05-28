import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,       //cloudinaryy url
            required: true
        },
        coverImage: {
            type: String        //cloudinary url
        },
        watchHistory: [{                    //stored in a arrayy 
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        password: {
            type: String,
            required: [true, 'password is required']        //display message on empty 
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }

)


userSchema.pre("save", async function (next) {      //pre is hook like (post,listen),   //save is middleware
    if (!this.isModified("password")) return;       //only when the pas.. changes when only next() fnc runs

    this.password = await bcrypt.hash(this.password, 10)
})


userSchema.methods.isPasswordCorrect = async function (password) {      // creating a method for checking
    return await bcrypt.compare(password, this.password)        //inbuilt func to compare
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)