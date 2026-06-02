import multer from "multer";                    
// multer used as a middlewares 

// multer.diskStorage() is explicitly instructing the server to store the file locally on its disk
// multer.memoryStorage() wanted to store it in memory as a buffer instead of on the disk
const storage = multer.diskStorage({            
    destination: function (req, file, cb){      // cb-> callback // file is extra thing provide by multer
        cb(null, "./public/temp")                                // for uploading files
    },
    filename: function (req, file, cb){ 
        cb(null, file.originalname)             //can use originalname cuz only for few time, it's there
    }

})

export const upload = multer({
    storage,          // also write as storage = storage (js concept)
})




// ULTRAAAAAAAA IMPORTANATTTTTTTTTTT
//It attaches the file's information to the req.file object so your controllers can access it later.