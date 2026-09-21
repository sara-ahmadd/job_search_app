import { userRepository } from "../../DB/repositories/index.js";
import { companyRepository } from "../../DB/repositories/index.js";
import { isAuthenticatedGraphql } from "../../graphQl_middlewares/isAuthenticated.js";
import { roles } from "../../../constants.js";

/**
 * check if company exists
 * @param {String} companyId
 * @returns Promise<Mongodb Document>
 */
const checkCompany = async (companyId) => {
  const company = await companyRepository.findOne({
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
    throw new Error("you are not authorized to perfom this action");
};

export const getAllDataGraphqlService = async () => {
  const data = await Promise.all([
    userRepository
      .find()
      .select(
        "-_id firstName lastName profilePic email coverPic gender DOB mobileNumber",
      )
      .lean(),
    companyRepository.find().select("-_id").lean(),
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
  const user = await userRepository.findOne({
    _id: userId,
    freezed: false,
    deletedAt: { $exists: false },
  });
  if (!user) throw new Error("user is not found");

  if (user._id.toString() === userId.toString())
    throw new Error("you cannot ban your account");

  if (user.bannedAt) {
    await userRepository.updateOne(
      { _id: userId },
      { $unset: { bannedAt: "" } },
    );
    return {
      message: "user Unbanned successfully",
      statusCode: 200,
    };
  }
  await userRepository.updateOne(
    { _id: userId },
    { bannedAt: new Date().getTime() },
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
    await companyRepository.updateOne(
      { _id: companyId },
      { $unset: { bannedAt: "" } },
    );
    return {
      message: "company Unbanned successfully",
      statusCode: 200,
    };
  }
  await companyRepository.updateOne(
    { _id: companyId },
    { bannedAt: new Date().getTime() },
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
