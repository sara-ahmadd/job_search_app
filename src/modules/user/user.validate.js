import joi from "joi";
import { userFields } from "../auth/auth.validate.js";
import { fileObject } from "../../../constants.js";

export const updateUserDataSchema = joi
  .object({
    mobileNumber: userFields.mobileNumber,
    DOB: userFields.DOB,
    gender: userFields.gender,
    firstName: userFields.firstName,
    lastName: userFields.lastName,
  })
  .required();

export const viewUserProfileSchema = joi
  .object({
    userId: joi.string().required(),
  })
  .required();

export const updatePasswordSchema = joi
  .object({
    email: userFields.email.required(),
    oldPassword: joi
      .string()
      .pattern(/[a-zA-Z0-9]+($%&*@)?/)
      .required(),
    newPassword: joi
      .string()
      .pattern(/[a-zA-Z0-9]+($%&*@)?/)
      .required(),
    confirmNewPassword: joi.string().valid(joi.ref("newPassword")).required(),
  })
  .required();

export const addProfilePicSchema = joi.object({
  file: joi
    .object({
      ...fileObject,
      fieldname: joi.string().valid("profilePic").required(),
    })
    .required(),
});

export const addCoverPicSchema = joi.object({
  file: joi
    .object({
      ...fileObject,
      fieldname: joi.string().valid("coverPic").required(),
    })
    .required(),
});
