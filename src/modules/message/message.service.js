import { create, findOne } from "../../db/models/dbservices.js";
import messageModel from "../../db/models/message.model.js";
import userModel from "../../db/models/user.model.js";
import { uploadFiles } from "../../utils/multer/cloudinary.js";
import { asyncHandler, successResponse } from "../../utils/response.js";

export const sendMessage = asyncHandler(async(req,res,next)=>{
    const {recieverId} = req.params;
    const {content} = req.body;

    const checkUserExsist = await findOne({model:userModel , filter:{
        _id:recieverId,
        deletedAt:{$exists:false},
        confirmEmail:{$exists:true}
    }})

    if(!checkUserExsist){
        return next(new Error("invalid reciever",{cause:404}))
    }
let attachments=[]
    if(req.files?.length){
         attachments = await uploadFiles({files:req.files,path:`message/${recieverId}`})
    }

    const message = await create({model:messageModel,data:{content,attachments,recievedBy:recieverId}})



    return successResponse({res,message:"message sent" , status:201,data:{message}})
})