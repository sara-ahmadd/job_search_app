import { decode } from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { verifyToken } from "../utils/token/token.js";

export const isAuthenticated = async (req, res, next) => {
  const { authorization } = req?.headers;
  if (!authorization) return next(new Error("User is unauthenticated"));
  const token = authorization.split(" ")[1];
  if (!token) return next(new Error("Token is required"));
  const data = verifyToken(token);
  const user = await UserModel.findById(data.id);

  if (!user) return next(new Error("User is not found"));

  if (user.freezed) return next(new Error("User is deleted", { cause: 400 }));
  if (user.bannedAt) return next(new Error("User is banned", { cause: 400 }));
  //extract time in which token is created
  //compare between it & last time password is changed
  //if token is created before password changed, return response : you must login first
  if (user.changeCredentialTime) {
    const payload = decode(token);
    const compareTimes =
      user.changeCredentialTime?.getTime() > payload.iat * 1000; //convert it to milliseconds;

    if (compareTimes) {
      return next(new Error("you must login first", { cause: 404 }));
    }
  }
  req.user = user;
  return next();
};
