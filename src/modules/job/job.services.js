import { CompanyModel } from "../../models/company.model.js";
import { JobModel } from "../../models/job.model.js";
import { checkUserById } from "../../utils/helpers/checkUser.js";
import { sendResponse } from "../../utils/helpers/globalResHandler.js";

/**
 *
 * @param {String} companyId
 * @param {import("express").NextFunction} next
 * @returns
 */
const checkCompany = async (companyId, next) => {
  const company = await CompanyModel.findById(companyId);

  if (!company) return next(new Error("company is not found", { cause: 400 }));
  if (company.bannedAt)
    return next(new Error("company is banned", { cause: 400 }));
  if (company.deletedAt)
    return next(new Error("company is deleted", { cause: 400 }));
  if (!company.approvedByAdmin)
    return next(
      new Error("company account is not approved by admin", { cause: 400 })
    );
  return company;
};

export const addJobService = async (req, res, next) => {
  const { companyId, ...reqBody } = req.body;
  const { user } = req;

  const company = await checkCompany(companyId, next);

  await checkUserById(user._id, next);

  if (
    company.createdBy.toString() !== user._id.toString() &&
    !company.hrs.map(String).includes(user._id.toString())
  )
    return next(
      new Error("you are not authorized to add a job", { cause: 400 })
    );

  const job = await JobModel.create({ ...req.body, addedBy: user._id });

  return sendResponse(res, 201, "job created successfully", job);
};

export const updateJobService = async (req, res, next) => {
  const { jobId } = req.params;
  const { user } = req;
  await checkUserById(user._id, next);

  const job = await JobModel.findById(jobId);

  if (!job) return next(new Error("job is not found", { cause: 400 }));
  if (job.closed) return next(new Error("job is closed", { cause: 400 }));

  const company = await checkCompany(job.companyId, next);
  if (
    company.createdBy.toString() !== user._id.toString() &&
    !company.hrs.map(String).includes(user._id.toString())
  )
    return next(
      new Error("you are not authorized to update a job", { cause: 400 })
    );

  const updatedJob = await JobModel.findByIdAndUpdate(
    jobId,
    {
      ...req.body,
      updatedBy: user._id,
    },
    { new: true }
  );
  return sendResponse(res, 201, "job updated successfully", updatedJob);
};

export const deleteJobService = async (req, res, next) => {
  const { jobId } = req.params;
  const { user } = req;
  await checkUserById(user._id, next);

  const job = await JobModel.findById(jobId);

  if (!job) return next(new Error("job is not found", { cause: 400 }));

  const company = await checkCompany(job.companyId, next);
  if (
    company.createdBy.toString() !== user._id.toString() &&
    !company.hrs.map(String).includes(user._id.toString())
  )
    return next(
      new Error("you are not authorized to delete this job", { cause: 400 })
    );

  const deletedJob = await JobModel.findByIdAndDelete({ _id: jobId });

  return sendResponse(res, 201, "job deleted successfully", deletedJob);
};
