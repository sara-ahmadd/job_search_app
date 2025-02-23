import { generate } from "otp-generator";
import { otpTypes, providers, sendEmailEvent } from "../../../constants.js";
import { UserModel } from "../../models/user.model.js";
import { compareHashedText, hashText } from "../../utils/hashing/hashing.js";
import { checkUserByEmail } from "../../utils/helpers/checkUser.js";
import { sendResponse } from "../../utils/helpers/globalResHandler.js";
import { myEventEmitter } from "../../utils/emails/sendEmail.js";
import { otpVerificationTemplate } from "../../utils/emails/otpVerifyEmail.js";
import { generateToken } from "../../utils/token/token.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
/**
 * send email with otp for account activation
 * @param {String} email
 * @param {string} otpType
 * @param {String} emailSubject
 * @returns
 */
const sendConfirmOtp = (email, otpType, emailSubject) => {
  //create otp for email confirmation
  // Generate OTP of length 5-15
  const otpLength = Math.floor(Math.random() * 10) + 5;
  const otp = generate(otpLength, {
    lowerCaseAlphabets: true,
    upperCaseAlphabets: true,
    digits: true,
  });

  myEventEmitter.emit(
    sendEmailEvent,
    email,
    emailSubject,
    otpVerificationTemplate(otp)
  );
  //hash otp
  const hashedOtp = hashText(otp);
  //otp expiration time
  const expiresIn = new Date(new Date().getTime() + 10 * 60 * 1000);

  return {
    code: hashedOtp,
    otpType,
    expiresIn,
  };
};

export const registerService = async (req, res, next) => {
  const { email, password, firstName, lastName, DOB, mobileNumber, gender } =
    req.body;
  //check if email already exists
  const user = await UserModel.findOne({ email });
  if (user) return next(new Error("this email already exists"));

  const otpObject = sendConfirmOtp(
    email,
    otpTypes.confirmEmail,
    "Account Verification Email"
  );
  const newUser = await UserModel.create({
    email,
    password,
    firstName,
    lastName,
    DOB,
    mobileNumber,
    gender,
    OTP: [otpObject],
  });

  return sendResponse(res, 201, "User registered successfully", newUser);
};

export const confirmOtpService = async (req, res, next) => {
  //get otp from req body
  const { otp, email } = req.body;

  const user = await checkUserByEmail(email, next);
  if (!user.OTP?.length) return next(new Error("otp is invalid"));
  //get user with this otp of type confirmEmail
  for (const item of user.OTP) {
    if (item.otpType == otpTypes.confirmEmail) {
      //compare otps
      const compareOtp = compareHashedText({
        plainText: otp,
        hashedValue: item.code,
      });
      const currentTime = new Date().getTime();
      if (!compareOtp || new Date(item.expiresIn).getTime() < currentTime) {
        return next(new Error("otp is invalid"));
      } else {
        //in case of true >> change isConfirmed to true
        await UserModel.updateOne({ email }, { isConfirmed: true });
        break;
      }
    }
  }

  return sendResponse(res, 200, "Email is confirmed successfully");
};

export const loginWithCredentialsService = async (req, res, next) => {
  const { password, email } = req.body;
  const user = await checkUserByEmail(email, next);

  if (user?.freezed || !user?.isConfirmed)
    return next(new Error("user is inactive", { cause: 400 }));

  const comparePasswords = compareHashedText({
    plainText: password,
    hashedValue: user.password,
  });

  if (!comparePasswords) {
    return next(new Error("Credentials are invalid", { cause: 400 }));
  }

  const accessToken = generateToken(
    { id: user._id, email },
    process.env.ACCESS_EXPIRY_TIME
  );
  const refreshToken = generateToken(
    { id: user._id, email },
    process.env.REFRESH_EXPIRY_TIME
  );
  return sendResponse(res, 200, "Logged in successfully", {
    accessToken,
    refreshToken,
  });
};

export const loginWithGmailService = async (req, res, next) => {
  const { idToken } = req.body;

  const clientId = process.env.CLIENT_ID;

  const client = new OAuth2Client(clientId);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const userData = ticket.getPayload();

  const { email_verified, email, name, picture, family_name, given_name } =
    userData;
  if (!email_verified) return next(new Error("invalid email"));

  const user = await UserModel.findOne({
    email,
    firstName: given_name,
    lastName: family_name,
    profilePic: { secure_url: picture, public_id: null },
    isConfirmed: true,
  });
  if (user) {
    const accessToken = generateToken(
      { id: user._id, email },
      process.env.ACCESS_EXPIRY_TIME
    );
    const refreshToken = generateToken(
      { id: user._id, email },
      process.env.REFRESH_EXPIRY_TIME
    );
    return sendResponse(res, 200, "Logged in with google successfully", {
      accessToken,
      refreshToken,
    });
  }
  const newUser = await UserModel.create({
    email,
    firstName: given_name,
    lastName: family_name,
    profilePic: { secure_url: picture, public_id: null },
    isConfirmed: true,
    provider: providers.google,
  });
  const accessToken = generateToken(
    { id: newUser._id, email },
    process.env.ACCESS_EXPIRY_TIME
  );
  const refreshToken = generateToken(
    { id: newUser._id, email },
    process.env.REFRESH_EXPIRY_TIME
  );
  return sendResponse(res, 200, "Logged in with google successfully", {
    accessToken,
    refreshToken,
  });
};

export const forgotPasswordService = async (req, res, next) => {
  const { email } = req.body;
  //this function handles case of notFound user
  const user = await checkUserByEmail(email);

  const otpObject = sendConfirmOtp(
    email,
    otpTypes.forgetPassword,
    "Reset Password Email"
  );

  await UserModel.findByIdAndUpdate(user._id, {
    OTP: [otpObject],
  });
  return sendResponse(
    res,
    201,
    "OTP is sent to your email, use it to be able reset your password"
  );
};

export const resetPasswordService = async (req, res, next) => {
  const { otp, newPassword, email } = req.body;
  const user = await checkUserByEmail(email, next);
  if (!user.OTP?.length) return next(new Error("otp is invalid"));
  //get user with this otp of type forgetPassword
  for (const item of user.OTP) {
    if (item.otpType == otpTypes.forgetPassword) {
      //compare otps
      const compareOtp = compareHashedText({
        plainText: otp,
        hashedValue: item.code,
      });
      const currentTime = new Date().getTime();
      if (!compareOtp || new Date(item.expiresIn).getTime() < currentTime) {
        return next(new Error("otp is invalid", { cause: 400 }));
      } else {
        user.password = newPassword;
        user.changeCredentialTime = new Date();
        await user.save();
        break;
      }
    }
  }
  return sendResponse(res, 200, "password reset successfully");
};

export const getNewAccessToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  //decode token to get its creation time and compare it with the last time password is updated
  const decodedToken = jwt.decode(refreshToken);
  //get user
  const user = await checkUserByEmail(decodedToken.email);

  const compareTimes =
    user.changeCredentialTime.getTime() > decodedToken.iat * 1000; //convert it to milliseconds;

  if (compareTimes) {
    return next(new Error("you must login first", { cause: 404 }));
  }
  const accessToken = generateToken(
    { id: user._id, email: decodedToken.email },
    process.env.ACCESS_EXPIRY_TIME
  );
  return sendResponse(res, 200, "New Access Token generated successfully", {
    accessToken,
  });
};
