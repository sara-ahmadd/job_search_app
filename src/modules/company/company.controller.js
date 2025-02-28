import { isAuthenticated } from "../../middlewares/isAuthenticated.js";
import { validate } from "../../middlewares/validateJoiSchema.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadCloudinary } from "../../utils/cloudUpload.js";
import {
  addCompanyCoverPicService,
  addCompanyLogoService,
  addNewCompanyService,
  deleteCompanyCoverPicService,
  deleteCompanyLogoService,
  deleteCompanyService,
  findCompanyService,
  getCompanyService,
  updateCompanyService,
} from "./company.services.js";
import {
  addComanySchema,
  addCompanyCoverPicSchema,
  addCompanyLogoSchema,
  deleteComanySchema,
  deleteCompanyCoverPictureSchema,
  deleteCompanyLogoSchema,
  findCompanySchema,
  getCompanySchema,
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

//get company by id
router.get(
  "/get_company/:id",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(getCompanySchema)),
  asyncHandler(getCompanyService)
);

//search for company with name
router.get(
  "/find_company",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(findCompanySchema)),
  asyncHandler(findCompanyService)
);

//add company logo
router.post(
  "/add_logo/:id",
  asyncHandler(isAuthenticated),
  uploadCloudinary().single("logo"),
  asyncHandler(validate(addCompanyLogoSchema)),
  asyncHandler(addCompanyLogoService)
);

//delete company logo
router.delete(
  "/delete_logo/:id",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(deleteCompanyLogoSchema)),
  asyncHandler(deleteCompanyLogoService)
);

//add company cover picture
router.post(
  "/add_cover/:id",
  asyncHandler(isAuthenticated),
  uploadCloudinary().single("coverPic"),
  asyncHandler(validate(addCompanyCoverPicSchema)),
  asyncHandler(addCompanyCoverPicService)
);

//add company logo
router.delete(
  "/delete_coverPicture/:id",
  asyncHandler(isAuthenticated),
  asyncHandler(validate(deleteCompanyCoverPictureSchema)),
  asyncHandler(deleteCompanyCoverPicService)
);
export default router;
