import { model, Schema, Types } from "mongoose";
import { JobModel } from "./job.model.js";

export const companySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    //describe company activities
    description: {
      type: String,
    },
    industry: {
      type: String,
    },
    address: {
      type: String,
    },
    employeesCount: {
      from: { type: Number },
      to: { type: Number },
    },
    companyEmail: { type: String, unique: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
    logo: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    coverPic: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    hrs: [{ type: Types.ObjectId, ref: "User" }],
    bannedAt: { type: Date },
    deletedAt: { type: Date },
    legalAttachment: {
      //pdf or img
      secure_url: { type: String },
      public_id: { type: String },
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

companySchema.virtual("jobs", {
  localField: "_id",
  foreignField: "companyId",
  ref: "Job",
});

export const CompanyModel = model("Company", companySchema);
