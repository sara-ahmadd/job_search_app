import { Types } from "mongoose";

/**
 * custom validation for validating mongodb objectId in joi
 * @param {*} value
 * @param {*} helpers
 * @returns
 */
export const validateObjectId = function (value, helpers) {
  const result = Types.ObjectId.isValid(value);
  if (!result) return helpers.error("any.invalid");
  return value;
};
