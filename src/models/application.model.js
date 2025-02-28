import { model, Schema, Types } from "mongoose";
import { jobStatus } from "../../constants";

const jobApplicationSchema = new Schema({
  jobId: {
    type: Types.ObjectId,
    ref: "Job",
  },
  userId: {
    //applier id
    type: Types.ObjectId,
    ref: "Job",
  },
  userCv: {
    //must be pdf
    secure_url: { type: String },
    public_id: { type: String },
  },
  status: {
    type: String,
    enum: [
      jobStatus.accepted,
      jobStatus.inConsideration,
      jobStatus.pending,
      jobStatus.rejected,
      jobStatus.viewed,
    ],
    default: jobStatus.pending,
  },
});

export const JobApplication = model("JobApplication", jobApplicationSchema);
