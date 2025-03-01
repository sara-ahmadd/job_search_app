import { CompanyModel } from "../../models/company.model.js";

/**
 * check if company with this id is found and approved by admin
 * @param {String} companyId
 * @returns {import("mongoose").MongooseDocument} company data
 */
export const checkCompanyById = async (companyId, next) => {
  const company = await CompanyModel.findById(companyId);
  if (!company) return next(new Error("company is not found"));
  if (!company.approvedByAdmin)
    return next(new Error("company is not approved"));
  if (company.bannedAt) return next(new Error("company is banned"));
  if (company.deletedAt) return next(new Error("company is soft-deleted"));
  return company;
};
