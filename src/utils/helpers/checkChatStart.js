import { CompanyModel } from "../../models/company.model.js";
import { UserModel } from "../../models/user.model.js";
import { checkCompanyById } from "./checkCompany.js";

export const isHr = async (companyId, socket) => {
  const user = await UserModel.findById(socket.userId);
  const company = await CompanyModel.findById(companyId);
  if (!company) {
    socket.emit("error", "company not found");
    return;
  }
  if (!company.approvedByAdmin) {
    socket.emit("error", "company not approved");
    return;
  }
  if (company.bannedAt) {
    socket.emit("error", "company is banned");
    return;
  }
  if (company.deletedAt) {
    socket.emit("error", "company is deleted");
    return;
  }
  //check if current user is company owner or hr in it
  if (
    company.createdBy.toString() !== user._id.toString() &&
    !company.hrs.map(String).includes(user._id.toString())
  ) {
    // Emit an error event instead of using `next`
    socket.emit("error", "You cannot start this conversation");
    return;
  }
};
