import { roles } from "../../../constants.js";
import { CompanyModel } from "../../models/company.model.js";
import { sendResponse } from "../../utils/helpers/globalResHandler.js";
import cloudinary from "./../../utils/cloudUpload.js";

/**
 * check if company with this id is found and approved by admin
 * @param {String} companyId
 * @returns {import("mongoose").MongooseDocument} company data
 */
const checkCompanyById = async (companyId, next) => {
  const company = await CompanyModel.findById(companyId);
  if (!company) return next(new Error("company is not found"));
  if (!company.approvedByAdmin)
    return next(new Error("company is not approved"));
  if (company.bannedAt) return next(new Error("company is banned"));
  if (company.deletedAt) return next(new Error("company is soft-deleted"));
  return company;
};

const isOwner = async (userId, companyId, next) => {
  const company = await CompanyModel.findById(companyId);
  if (company.createdBy.toString() !== userId.toString()) {
    next(
      new Error("you are not authorized to perform this action", { cause: 400 })
    );
    return false;
  }
  return true;
};

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
    "company account created successfully and will be approved by admin soon",
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
  const company = await checkCompanyById(companyId, next);
  const owner = await isOwner(user._id, companyId, next);
  if (!owner) return;

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
  const company = await checkCompanyById(id, next);
  if (
    user._id.toString() !== company.createdBy.toString() ||
    user.role !== roles.admin
  )
    return next(new Error("you cannot delete this company."));

  company.deletedAt = new Date().getTime();
  await company.save();
  return sendResponse(res, 200, "company is soft-deleted successfully");
};

export const getCompanyService = async (req, res, next) => {
  const { id } = req.params;
  const company = await CompanyModel.findById(id).populate("jobs");
  if (!company || company?.deletedAt)
    return next(new Error("company is not found"));

  return sendResponse(res, 200, "company retreived successfully", company);
};

export const findCompanyService = async (req, res, next) => {
  const { name } = req.query;
  const company = await CompanyModel.findOne({
    name: { $regex: new RegExp(name, "i") },
  });
  if (!company || company?.deletedAt)
    return next(new Error("company is not found"));

  return sendResponse(res, 200, "company retreived successfully", company);
};

export const addCompanyLogoService = async (req, res, next) => {
  const { file, user } = req;
  const { id } = req.params;

  //check if company exists and approved by admin
  const company = await checkCompanyById(id, next);

  //check if the owner performs this action
  const owner = await isOwner(user._id, id, next);

  if (!owner) return;
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `/${process.env.CLOUD_APP_FOLDER}/companies/logo`,
    }
  );
  company.logo = { secure_url, public_id };
  await company.save();

  return sendResponse(res, 201, "logo uploaded successfully", {
    secure_url,
    public_id,
  });
};

export const addCompanyCoverPicService = async (req, res, next) => {
  const { file, user } = req;
  const { id } = req.params;

  //check if company exists and approved by admin
  const company = await checkCompanyById(id, next);

  //check if the owner performs this action
  const owner = await isOwner(user._id, id, next);
  if (!owner) return;

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `/${process.env.CLOUD_APP_FOLDER}/companies/coverPic`,
    }
  );
  company.coverPic = { secure_url, public_id };
  await company.save();

  return sendResponse(res, 201, "cover picture uploaded successfully", {
    secure_url,
    public_id,
  });
};

export const deleteCompanyLogoService = async (req, res, next) => {
  const { id } = req.params;

  const { user } = req;

  //check if company exists and approved by admin
  const company = await checkCompanyById(id, next);

  //check if the owner performs this action
  const owner = await isOwner(user._id, id, next);
  if (!owner) return;

  if (company?.logo.secure_url) {
    //remove logo from database and cloudinary as well
    await CompanyModel.findByIdAndUpdate(id, { $unset: { logo: "" } });
    await cloudinary.uploader.destroy(company.logo.public_id);
    return sendResponse(res, 200, "logo deleted successfully");
  } else {
    return next(new Error("company has no logo"));
  }
};

export const deleteCompanyCoverPicService = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;
  const company = await checkCompanyById(id, next);
  const owner = await isOwner(user._id, id, next);
  if (!owner) return;
  if (company?.coverPic.secure_url) {
    //remove coverPic from database and cloudinary as well
    await CompanyModel.findByIdAndUpdate(id, { $unset: { coverPic: "" } });
    await cloudinary.uploader.destroy(company.coverPic.public_id);
    return sendResponse(res, 200, "cover picture deleted successfully");
  } else {
    return next(new Error("company has no cover picture"));
  }
};
