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

//pre is hook like (post,listen) & save is a middleware
userSchema.pre("save", async function (next) {      
    //only when the pas.. changes when only next() fnc runs
    if (!this.isModified("password")) return;       

    this.password = await bcrypt.hash(this.password, 10)
})

// creating a method for checking
userSchema.methods.isPasswordCorrect = async function (password) {
    //inbuilt func to compare      
    return await bcrypt.compare(password, this.password)        
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