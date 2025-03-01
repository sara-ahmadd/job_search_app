import joi from "joi";
import {
  jobLocations,
  seniorityLevel,
  workingTime,
} from "../../../constants.js";
import { validateObjectId } from "../../utils/helpers/isValidMongoObjectId.js";

export const jobFields = {
  jobTitle: joi.string(),

  jobLocation: joi
    .string()
    .valid(...Object.values(jobLocations).map((x) => x.toLowerCase())),
  workingTime: joi
    .string()
    .valid(...Object.values(workingTime).map((x) => x.toLowerCase())),
  seniorityLevel: joi
    .string()
    .valid(...Object.values(seniorityLevel).map((x) => x.toLowerCase())),
  jobDescription: joi.string(),

  technicalSkills: joi.array().items(joi.string()),

  softSkills: joi.array().items(joi.string()),

  addedBy: joi.string().custom(validateObjectId),
  updatedBy: joi.string().custom(validateObjectId).optional(),

  closed: joi.boolean().default(false),

  companyId: joi.string().custom(validateObjectId),
};

export const addJobSchema = joi
  .object({
    jobTitle: jobFields.jobTitle.required(),
    jobLocation: jobFields.jobLocation.required(),
    workingTime: jobFields.workingTime.required(),
    seniorityLevel: jobFields.seniorityLevel.required(),
    jobDescription: jobFields.jobDescription.required(),
    technicalSkills: jobFields.technicalSkills.required(),
    softSkills: jobFields.softSkills.required(),
    companyId: jobFields.companyId.required(),
  })
  .required();

export const updateJobSchema = joi
  .object({
    jobTitle: jobFields.jobTitle,
    jobLocation: jobFields.jobLocation,
    workingTime: jobFields.workingTime,
    seniorityLevel: jobFields.seniorityLevel,
    jobDescription: jobFields.jobDescription,
    technicalSkills: jobFields.technicalSkills,
    softSkills: jobFields.softSkills,
    jobId: joi.string().custom(validateObjectId).required(),
  })
  .required();

export const deleteJobSchema = joi.object({
  jobId: joi.string().custom(validateObjectId).required(),
});

export const getAllJobsForSingleCompanySchema = joi
  .object({
    jobId: joi.string().custom(validateObjectId),
    companyName: joi.string().required(),
    pageNumber: joi.string(),
  })
  .required();

export const getAllJobsSchema = joi
  .object({
    workingTime: jobFields.workingTime,
    jobLocation: jobFields.jobLocation,
    seniorityLevel: jobFields.seniorityLevel,
    jobTitle: jobFields.jobTitle,
    technicalSkills: jobFields.technicalSkills,
    pageNumber: joi.string(),
  })
  .required();
