import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isAuthenticated } from "../../middlewares/isAuthenticated.js";
import { validate } from "../../middlewares/validateJoiSchema.js";
import {
  applyToJobSchema,
  getAllApplicationsSchema,
  updateApplicationsSchema,
} from "./application.validate.js";
import { uploadCloudinary } from "../../utils/cloudUpload.js";
import { isValidFileType } from "../../middlewares/isValidFileMimeType.js";
import {
  applyToJobService,
  getAllApplicationsService,
  updateApplicationsService,
} from "./application.services.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";
import { roles } from "../../../constants.js";

const router = Router();

//apply for a job
router.post(
  "/apply/:jobId",
  asyncHandler(isAuthenticated),
  asyncHandler(isAuthorized([roles.user])),
  uploadCloudinary().single("userCv"),
  asyncHandler(validate(applyToJobSchema)),
  asyncHandler(isValidFileType(["application/pdf"])),
  asyncHandler(applyToJobService)
);

//Get all applications for specific Job.
router.get(
  "/all_applications/:jobId",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(getAllApplicationsSchema)),
  asyncHandler(getAllApplicationsService)
);

//hr accept/reject candidate
router.patch(
  "/update_application_status/:applicationId",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(updateApplicationsSchema)),
  asyncHandler(updateApplicationsService)
);
export default router;
