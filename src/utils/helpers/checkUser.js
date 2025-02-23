import { UserModel } from "../../models/user.model.js";

/**
 * Check if user already exists using user's email, return user if exists or throw error if not exists
 * @param {String} email
 * @param {import("express").NextFunction} next
 * @returns
 */
export const checkUserByEmail = async (email, next) => {
  const user = await UserModel.findOne({
    email,
    freezed: false,
    deletedAt: { $exists: false },
  });
  if (!user) return next(new Error("user is not found", { cause: 404 }));
  return user;
};

/**
 * Check if user already exists using user's id
 * @param {String} id
 * @returns
 */
export const checkUserById = async (id) => {
  const user = await UserModel.findById(id);
  if (!user) return false;
  return user;
};
