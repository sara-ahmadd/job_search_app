import { JobApplication } from "../models/application.model.js";
import { ChatModel } from "../models/chat.model.js";
import { CompanyModel } from "../models/company.model.js";
import { JobModel } from "../models/job.model.js";
import { UserModel } from "../models/user.model.js";

export class DBRepository {
  constructor(model) {
    this.model = model;
  }
  create(data) {
    return this.model.create(data);
  }
  findById(id) {
    return this.model.findById(id);
  }
  findOne(options = {}) {
    return this.model.findOne(options);
  }
  find(options = {}) {
    return this.model.find(options);
  }
  deleteOne(options = {}) {
    return this.model.deleteOne(options);
  }
  updateOne(filters = {}, options = {}) {
    return this.model.updateOne(filters, options);
  }
  updateMany(filters = {}, options = {}) {
    return this.model.updateMany(filters, options);
  }
  findByIdAndUpdate(id, options = {}) {
    return this.model.updateOne(id, options);
  }
}
export const userRepository = new DBRepository(UserModel);
export const jobRepository = new DBRepository(JobModel);
export const companyRepository = new DBRepository(CompanyModel);
export const chatRepository = new DBRepository(ChatModel);
export const applicationRepository = new DBRepository(JobApplication);
