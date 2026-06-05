import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function (fileUploadPath) {
    try {
        if(!fileUploadPath) return null;

        const response = await cloudinary.uploader.upload(fileUploadPath,{
            resource_type: 'auto'
        })
        // console.log("Upload successfully", response.url)
        fs.unlinkSync(fileUploadPath)   //remove the file from the server
        return response;
    } catch (error) {
        //console.error("cloudinary upload error : ", error)
        fs.unlinkSync(fileUploadPath) //Delete the file from local/server after upload is failed
        
        return null;
    }
}

export {uploadOnCloudinary}