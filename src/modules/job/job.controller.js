import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isAuthenticated } from "../../middlewares/isAuthenticated.js";
import { validate } from "../../middlewares/validateJoiSchema.js";

import { uploadCloudinary } from "../../utils/cloudUpload.js";
import {
  addJobSchema,
  deleteJobSchema,
  updateJobSchema,
} from "./job.validate.js";
import {
  addJobService,
  deleteJobService,
  updateJobService,
} from "./job.services.js";

const router = Router();

//add job by a company hr or owner
router.post(
  "/add_job",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(addJobSchema)),
  asyncHandler(addJobService)
);

//update job by a company  owner
router.patch(
  "/update_job/:jobId",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(updateJobSchema)),
  asyncHandler(updateJobService)
);

//delete a job by the owner
router.delete(
  "/delete_job/:jobId",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(deleteJobSchema)),
  asyncHandler(deleteJobService)
);

export default router;
