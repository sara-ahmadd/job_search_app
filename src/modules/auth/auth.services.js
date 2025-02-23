import { generate } from "otp-generator";
import { otpTypes, sendEmailEvent } from "../../../constants.js";
import { UserModel } from "../../models/user.model.js";
import { compareHashedText, hashText } from "../../utils/hashing/hashing.js";
import { checkUserByEmail } from "../../utils/helpers/checkUser.js";
import { sendResponse } from "../../utils/helpers/globalResHandler.js";
import { myEventEmitter } from "../../utils/emails/sendEmail.js";
import { otpVerificationTemplate } from "../../utils/emails/otpVerifyEmail.js";
import { generateToken } from "../../utils/token/token.js";

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
      //in case of true >> change isConfirmed to true
      if (!compareOtp) {
        return next(new Error("otp is invalid"));
      } else {
        user.isConfirmed = true;
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
