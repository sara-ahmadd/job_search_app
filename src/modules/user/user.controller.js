import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isAuthenticated } from "../../middlewares/isAuthenticated.js";
import { validate } from "../../middlewares/validateJoiSchema.js";
import {
  addUserCoverPicService,
  addUserProfilePicService,
  deleteAccountService,
  deleteCoverPicService,
  deleteProfilePicService,
  getUserProfileService,
  updatePasswordService,
  updateUserDataService,
  viewUserProfileService,
} from "./user.services.js";
import {
  addCoverPicSchema,
  addProfilePicSchema,
  updatePasswordSchema,
  updateUserDataSchema,
  viewUserProfileSchema,
} from "./user.validate.js";
import { uploadCloudinary } from "../../utils/cloudUpload.js";

const router = Router();

//update current user profile
router.patch(
  "/update",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(updateUserDataSchema)),
  asyncHandler(updateUserDataService)
);

//get current user profile
router.get(
  "/profile",
  asyncHandler(isAuthenticated),
  asyncHandler(getUserProfileService)
);

//preview another user profile
router.get(
  "/view_profile/:userId",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(viewUserProfileSchema)),
  asyncHandler(viewUserProfileService)
);

//change password
router.post(
  "/update_password",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(updatePasswordSchema)),
  asyncHandler(updatePasswordService)
);

//add profile picture
router.post(
  "/add_profilePicture",
  asyncHandler(isAuthenticated),
  uploadCloudinary().single("profilePic"),
  asyncHandler(validate(addProfilePicSchema)),
  asyncHandler(addUserProfilePicService)
);

//add cover picture
router.post(
  "/add_coverPicture",
  asyncHandler(isAuthenticated),
  uploadCloudinary().single("coverPic"),
  asyncHandler(validate(addCoverPicSchema)),
  asyncHandler(addUserCoverPicService)
);

//delete profile picture
router.delete(
  "/delete_profilePic",
  asyncHandler(isAuthenticated),
  asyncHandler(deleteProfilePicService)
);

//delete cover picture
router.delete(
  "/delete_coverPic",
  asyncHandler(isAuthenticated),
  asyncHandler(deleteCoverPicService)
);

//delete account (freeze)
router.get(
  "/softDelete_account",
  asyncHandler(isAuthenticated),
  asyncHandler(deleteAccountService)
);

export default router;
