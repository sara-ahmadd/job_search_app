import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  confirmOtpService,
  loginWithCredentialsService,
  registerService,
} from "./auth.services.js";
import { validate } from "../../middlewares/validateJoiSchema.js";
import {
  confirmOtpSchema,
  loginWithCredentialsSchema,
  registerSchema,
} from "./auth.validate.js";

const router = Router();

//register
router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerService)
);
//confirm otp
router.post(
  "/confirm_otp",
  validate(confirmOtpSchema),
  asyncHandler(confirmOtpService)
);

//login with email & password
router.post(
  "/login_credentials",
  validate(loginWithCredentialsSchema),
  asyncHandler(loginWithCredentialsService)
);
export default router;
