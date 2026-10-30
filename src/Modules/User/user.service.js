import { findByIdAndUpdate } from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import successResponse from "../../Utils/response/success.response.js";

export const getProfile = async (req, res) => {
  successResponse({ res, message: "Done", data: { user: req.user } });
};

export const uploadProfilePic = async (req, res) => {
  const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: { profilePic: req.file.finalPath },
  });
  successResponse({ res, message: "Done", data: { user:user } });
};

export const uploadCoverImages = async(req, res)=>{
const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: {coverPic: req.files?.map((file)=>file.finalPath)},
  });
  successResponse({ res, message: "Done", data: { user:user } });
};