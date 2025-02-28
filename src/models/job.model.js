import { model, Schema, Types } from "mongoose";
import { jobLocations, seniorityLevel, workingTime } from "../../constants.js";

export const JobSchema = new Schema({
  jobTitle: {
    type: String,
  },
  jobLocation: {
    type: String,
    enum: [jobLocations.onsite, jobLocations.hybrid, jobLocations.remotely],
  },
  workingTime: {
    type: String,
    enum: [workingTime.fullTime, workingTime.partTime],
  },
  seniorityLevel: {
    type: String,
    enum: [
      seniorityLevel.fresh,
      seniorityLevel.junior,
      seniorityLevel.midLevel,
      seniorityLevel.senior,
      seniorityLevel.CTO,
    ],
  },
  jobDescription: {
    type: String,
  },
  technicalSkills: [{ type: String }],
  softSkillss: [{ type: String }],
  addedBy: { type: Types.ObjectId, ref: "User" }, //hr belongs to the company
  updatedBy: { type: Types.ObjectId, ref: "User" }, //hr belongs to the company
  closed: { type: Boolean, default: false },
  companyId: { type: Types.ObjectId, ref: "Company" },
});

export const JobModel = model("Job", JobSchema);
