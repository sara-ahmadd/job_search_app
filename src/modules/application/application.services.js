import { jobStatus } from "../../../constants.js";
import { JobApplication } from "../../models/application.model.js";
import { JobModel } from "../../models/job.model.js";
import { UserModel } from "../../models/user.model.js";
import cloudinary from "../../utils/cloudUpload.js";
import { acceptanceTemplate } from "../../utils/emails/applicationEmails/acceptance.js";
import { rejectionTemplate } from "../../utils/emails/applicationEmails/rejection.js";
import { sendEmail } from "../../utils/emails/sendEmail.js";
import { decrypt } from "../../utils/encryption/encryption.js";
import { checkCompanyById } from "../../utils/helpers/checkCompany.js";
import { sendResponse } from "../../utils/helpers/globalResHandler.js";

export const applyToJobService = async (req, res, next) => {
  const { user, body, file } = req;
  const { jobId } = req.params;
  //check if job still available
  const job = await JobModel.findById(jobId);
  if (!job) return next(new Error("job is not found", { cause: 400 }));
  if (job.closed) return next(new Error("job is closed", { cause: 400 }));

  //upload user cv
  if (!file) {
    return next(new Error("cv must be provided", { cause: 400 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file?.path,
    {
      folder: `${process.env.CLOUD_APP_FOLDER}/jobs/${job._id}/job_applications/user_${user._id}`,
    }
  );

  const application = await JobApplication.create({
    ...body,
    userId: user._id,
    userCv: { secure_url, public_id },
    jobId,
  });

  return sendResponse(res, 201, "application sent successfully", application);
};

export const getAllApplicationsService = async (req, res, next) => {
  const { user } = req;
  const { jobId } = req.params;
  const { pageNumber } = req.query;

  const job = await JobModel.findById(jobId).populate("applications");
  if (!job) return next(new Error("job is not found", { cause: 404 }));

  const company = await checkCompanyById(job.companyId, next);
  if (
    company.createdBy.toString() !== user._id.toString() &&
    !company.hrs.map(String).includes(user._id.toString())
  ) {
    return next(new Error("you are not authorized to display applications"));
  }

  const applications = await JobApplication.find({ jobId })
    .populate({
      path: "userId",
      select: "firstName lastName email mobileNumber profilePic coverPic",
    })
    .lean()
    .paginate(pageNumber);

  //change userId into userData key
  const formattedApps = applications?.data?.map((i) => {
    const app = {
      ...i,
      userData: {
        ...i.userId,
        mobileNumber: decrypt({ cypherText: i.userId.mobileNumber }),
      },
    };
    delete app.userId;
    return app;
  });

  return sendResponse(
    res,
    200,
    "applications retreived successfully",
    formattedApps
  );
};

export const updateApplicationsService = async (req, res, next) => {
  const { user } = req;
  const { applicationId } = req.params;
  const { status } = req.query;

  const application = await JobApplication.findById(applicationId);

  const candidate = await UserModel.findById(application.userId);

  const job = await JobModel.findById(application.jobId);

  const company = await checkCompanyById(job.companyId);
  if (
    company.createdBy.toString() !== user._id.toString() &&
    !company.hrs.map(String).includes(user._id.toString())
  ) {
    return next(
      new Error("you are not authorized to update application status")
    );
  }
  application.status = status;
  await application.save();
  if (status === jobStatus.accepted) {
    sendEmail(
      candidate.email,
      "Application status",
      acceptanceTemplate(candidate.firstName, job.jobTitle)
    );
  }
  if (status === jobStatus.rejected) {
    sendEmail(
      candidate.email,
      "Application status",
      rejectionTemplate(candidate.firstName, job.jobTitle, company.name)
    );
  }
  return sendResponse(
    res,
    200,
    `Application status updated to ${status} successfully`
  );
};
