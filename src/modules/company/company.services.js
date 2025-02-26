import { roles } from "../../../constants.js";
import { CompanyModel } from "../../models/company.model.js";
import { sendResponse } from "../../utils/helpers/globalResHandler.js";
import cloudinary from "./../../utils/cloudUpload.js";

export const addNewCompanyService = async (req, res, next) => {
  const { body, file, user } = req;
  const { name, companyEmail, description, industry, employeesCount, address } =
    body;
  const empCount = employeesCount.split(",");
  let image;
  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.CLOUD_APP_FOLDER}/companies/legalAttachments`,
      }
    );
    image = { secure_url, public_id };
  }
  let company;
  if (image?.secure_url) {
    company = await CompanyModel.create({
      name,
      companyEmail,
      description,
      industry,
      employeesCount: { from: empCount[0], to: empCount[1] },
      address,
      legalAttachment: { ...image },
      createdBy: user._id,
    });
  } else {
    company = await CompanyModel.create({
      name,
      companyEmail,
      description,
      industry,
      employeesCount: { from: empCount[0], to: empCount[1] },
      address,
      createdBy: user._id,
    });
  }
  return sendResponse(
    res,
    201,
    "company account created successfully",
    company
  );
};

export const updateCompanyService = async (req, res, next) => {
  const { user } = req;
  const { companyId } = req.params;
  const { name, description, industry, employeesCount, address, companyEmail } =
    req.body;
  let empCount = [];
  if (employeesCount) {
    empCount = employeesCount.split(",");
  }
  const company = await CompanyModel.findById(companyId);
  if (!company) return next(new Error("company is not found"));
  if (company.bannedAt) return next(new Error("company is banned"));
  if (company.deletedAt) return next(new Error("company is soft-deleted"));
  if (user._id.toString() !== company.createdBy.toString())
    return next(new Error("you cannot update company's data"));

  const updatedCompany = await CompanyModel.findByIdAndUpdate(
    companyId,
    {
      name,
      description,
      industry,
      employeesCount: empCount.length
        ? { from: empCount[0], to: empCount[1] }
        : company.employeesCount,
      address,
      companyEmail,
    },
    { new: true }
  );

  return sendResponse(
    res,
    200,
    "company data updated successfully",
    updatedCompany
  );
};

export const deleteCompanyService = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;
  const company = await CompanyModel.findById(id);
  if (!company) return next(new Error("company is not found"));
  if (company.bannedAt) return next(new Error("company is banned"));
  if (company.deletedAt) return next(new Error("company is soft-deleted"));
  if (
    user._id.toString() !== company.createdBy.toString() ||
    user.role !== roles.admin
  )
    return next(new Error("you cannot delete this company."));

  company.deletedAt = new Date().getTime();
  await company.save();
  return sendResponse(res, 200, "company is soft-deleted successfully");
};
