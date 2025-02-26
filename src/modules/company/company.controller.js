import { isAuthenticated } from "../../middlewares/isAuthenticated.js";
import { validate } from "../../middlewares/validateJoiSchema.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadCloudinary } from "../../utils/cloudUpload.js";
import {
  addNewCompanyService,
  deleteCompanyService,
  updateCompanyService,
} from "./company.services.js";
import {
  addComanySchema,
  deleteComanySchema,
  updateComanySchema,
} from "./company.validate.js";
import { Router } from "express";

const router = Router();

//add company
router.post(
  "/register_company",
  asyncHandler(isAuthenticated),
  uploadCloudinary().single("legalAttachment"),
  asyncHandler(validate(addComanySchema)),
  asyncHandler(addNewCompanyService)
);

//update company data except legalAttachment >> by owner only (user who created company account)
router.patch(
  "/update_company/:companyId",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(updateComanySchema)),
  asyncHandler(updateCompanyService)
);

//soft delete company
router.get(
  "/delete_company/:id",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(deleteComanySchema)),
  asyncHandler(deleteCompanyService)
);

export default router;
