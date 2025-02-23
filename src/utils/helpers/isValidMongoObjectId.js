import { isValidObjectId } from "mongoose";

export const isValidMongoObjectId = (objectId) => {
  if (!objectId) return false;
  return isValidObjectId(objectId);
};
