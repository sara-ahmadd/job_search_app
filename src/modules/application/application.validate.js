import joi from "joi";
import { fileObject, jobStatus } from "../../../constants.js";
import { validateObjectId } from "../../utils/helpers/isValidMongoObjectId.js";

export const applicationFields = {
  jobId: joi.string().custom(validateObjectId).required(),

  userId: joi.string().custom(validateObjectId).required(),

  file: joi.object({ ...fileObject, fieldname: "userCv" }),

  status: joi
    .string()
    .valid(...Object.values(jobStatus))
    .default(jobStatus.pending),
};

export const applyToJobSchema = joi
  .object({
    jobId: applicationFields.jobId.required(),
    file: applicationFields.file.required(),
  })
  .required();

export const getAllApplicationsSchema = joi
  .object({
    jobId: applicationFields.jobId.required(),
    pageNumber: joi.string(),
  })
  .required();

export const updateApplicationsSchema = joi
  .object({
    status: applicationFields.status.required(),
    applicationId: applicationFields.jobId.required(),
  })
  .required();
