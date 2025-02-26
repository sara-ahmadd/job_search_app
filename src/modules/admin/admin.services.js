import { GraphQLString } from "graphql";
import { getAllDataResponseType } from "./admin.graphql.types.js";
import { UserModel } from "../../models/user.model.js";
import { CompanyModel } from "../../models/company.model.js";
import { isAuthenticatedGraphql } from "../../graphQl_middlewares/isAuthenticated.js";
import { roles } from "../../../constants.js";

/**
 * check if company exists
 * @param {String} companyId
 * @returns Promise<Mongodb Document>
 */
const checkCompany = async (companyId) => {
  const company = await CompanyModel.findOne({
    _id: companyId,
    deletedAt: { $exists: false },
  });
  if (!company) throw new Error("company is not found");

  return company;
};
/**
 * check if current user's role is admin
 * @param {String} auth
 */
const isAdmin = async (auth) => {
  //use token to get the current user account
  const currentUser = await isAuthenticatedGraphql(auth);
  if (currentUser.role !== roles.admin)
    throw new Error("you are not authenticated to perfom this action");
};

export const getAllDataGraphqlService = async (parent, args) => {
  const data = await Promise.all([
    UserModel.find()
      .select(
        "-_id firstName lastName profilePic email coverPic gender DOB mobileNumber"
      )
      .lean(),
    CompanyModel.find().select("-_id").lean(),
  ]);

  return {
    message: "Success",
    statusCode: 200,
    data: { users: data[0], companies: data[1] },
  };
};

export const banOrUnbanUser = async (parent, args) => {
  const { userId, auth } = args;
  await isAdmin(auth);
  const user = await UserModel.findOne({
    _id: userId,
    freezed: false,
    deletedAt: { $exists: false },
  });
  if (!user) throw new Error("user is not found");

  if (currentUser._id.toString() === userId.toString())
    throw new Error("you cannot ban your account");

  if (user.bannedAt) {
    await UserModel.updateOne({ _id: userId }, { $unset: { bannedAt: "" } });
    return {
      message: "user Unbanned successfully",
      statusCode: 200,
    };
  }
  await UserModel.updateOne(
    { _id: userId },
    { bannedAt: new Date().getTime() }
  );
  return {
    message: "user banned successfully",
    statusCode: 200,
  };
};

export const banOrUnbanCompany = async (parent, args) => {
  const { companyId, auth } = args;
  await isAdmin(auth);
  const company = await checkCompany(companyId);

  if (company.bannedAt) {
    await CompanyModel.updateOne(
      { _id: companyId },
      { $unset: { bannedAt: "" } }
    );
    return {
      message: "company Unbanned successfully",
      statusCode: 200,
    };
  }
  await CompanyModel.updateOne(
    { _id: companyId },
    { bannedAt: new Date().getTime() }
  );
  return {
    message: "company banned successfully",
    statusCode: 200,
  };
};

export const approveCompanyGraphqlService = async (parent, args) => {
  const { companyId, auth } = args;
  await isAdmin(auth);
  const company = await checkCompany(companyId);
  if (company.bannedAt) throw new Error("company is banned");

  company.approvedByAdmin = true;
  await company.save();

  return {
    message: "company is approved successfully",
    statusCode: 200,
  };
};
