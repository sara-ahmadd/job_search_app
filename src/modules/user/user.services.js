import {
  defaultCoverPic,
  defaultProfilePic,
  UserModel,
} from "../../models/user.model.js";
import cloudinary from "../../utils/cloudUpload.js";
import { encryptText } from "../../utils/encryption/encryption.js";
import { compareHashedText } from "../../utils/hashing/hashing.js";
import {
  checkUserByEmail,
  checkUserById,
} from "../../utils/helpers/checkUser.js";
import { sendResponse } from "../../utils/helpers/globalResHandler.js";

export const updateUserDataService = async (req, res, next) => {
  const { user } = req;
  const { firstName, lastName, DOB, gender, mobileNumber } = req.body;

  //check if user exists and not banned or deleted or not confirmed
  await checkUserById(user._id, next);

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    {
      firstName,
      lastName,
      DOB,
      gender,
      mobileNumber: encryptText(mobileNumber),
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(new Error("User not found or update failed"));
  }

  return sendResponse(res, 200, "User updated successfully", updatedUser);
};

export const getUserProfileService = async (req, res, next) => {
  const { user } = req;

  //check if user exists and not banned or deleted or not confirmed
  const getUser = await checkUserById(user._id, next, "-password");

  return sendResponse(res, 200, "user profile retreived successfully", getUser);
};

export const viewUserProfileService = async (req, res, next) => {
  const { userId } = req.params;
  const { user } = req;
  await checkUserById(user._id, next);
  //get target user
  const target = await UserModel.findOne({
    _id: userId,
    freezed: false,
    isConfirmed: true,
    bannedAt: { $exists: false },
  }).select("userName mobileNumber profilePic coverPic firstName lastName");
  if (!target)
    return next(new Error("target user is not found", { cause: 404 }));
  return sendResponse(res, 200, "user profile viewed successfully", {
    profilePic: target.profilePic,
    coverPic: target.coverPic,
    _id: target._id,
    mobileNumber: target.mobileNumber,
    userName: target.userName,
  });
};

export const updatePasswordService = async (req, res, next) => {
  const { user } = req;
  const { newPassword, email, oldPassword } = req.body;
  await checkUserById(user._id, next);

  //make sure that the user that is changing the password is the same whose token is authenticated
  if (user.email !== email)
    return next(
      new Error("You arenot authorized to update password of this profile", {
        cause: 400,
      })
    );

  const checkUser = await checkUserByEmail(email, next);

  const verifyOldPass = compareHashedText({
    plainText: oldPassword,
    hashedValue: checkUser.password,
  });
  if (!verifyOldPass)
    return next(new Error("Old password is invalid", { cause: 400 }));

  const currDateTime = new Date().getTime();
  checkUser.changeCredentialTime = currDateTime;

  checkUser.password = newPassword;
  await checkUser.save();
  return res
    .status(200)
    .json({ status: "Success", message: "Password is updated successfully" });
};

export const addUserProfilePicService = async (req, res, next) => {
  const { file, user } = req;

  const checkUser = await checkUserById(user._id, next);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `/${process.env.CLOUD_APP_FOLDER}/users/${user._id}/profilePic`,
    }
  );
  checkUser.profilePic = { secure_url, public_id };
  await checkUser.save();

  return sendResponse(res, 201, "profile picture uploaded successfully", {
    secure_url,
    public_id,
  });
};

export const addUserCoverPicService = async (req, res, next) => {
  const { file, user } = req;

  const checkUser = await checkUserById(user._id, next);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `/${process.env.CLOUD_APP_FOLDER}/users/${user._id}/coverPic`,
    }
  );
  checkUser.coverPic = { secure_url, public_id };
  await checkUser.save();

  return sendResponse(res, 201, "cover picture uploaded successfully", {
    secure_url,
    public_id,
  });
};

export const deleteProfilePicService = async (req, res, next) => {
  const { user } = req;

  const checkUser = await checkUserById(user._id, next);

  await cloudinary.uploader.destroy(checkUser.profilePic.public_id);
  checkUser.profilePic = { secure_url: defaultProfilePic };
  await checkUser.save();

  return sendResponse(res, 201, "profile picture deleted successfully");
};

export const deleteCoverPicService = async (req, res, next) => {
  const { user } = req;

  const checkUser = await checkUserById(user._id, next);

  await cloudinary.uploader.destroy(checkUser.coverPic.public_id);
  checkUser.coverPic = { secure_url: defaultCoverPic };
  await checkUser.save();

  return sendResponse(res, 201, "cover picture deleted successfully");
};

export const deleteAccountService = async (req, res, next) => {
  const { user } = req;
  await checkUserById(user._id, next);
  user.freezed = true;
  await user.save();
  return sendResponse(res, 200, "user account soft-deleted successfully");
};
