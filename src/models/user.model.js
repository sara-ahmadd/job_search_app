import { model, Schema } from "mongoose";
import {
  genders,
  otpTypes,
  providers,
  roles,
  sendEmailEvent,
} from "../../constants.js";
import { isValidDOB } from "../utils/helpers/isValidDOB.js";
import { hashText } from "../utils/hashing/hashing.js";
import { decrypt, encryptText } from "../utils/encryption/encryption.js";
import { myEventEmitter } from "../utils/emails/sendEmail.js";
import { otpVerificationTemplate } from "../utils/emails/otpVerifyEmail.js";
import { generate } from "otp-generator";

export const defaultProfilePic =
  "https://res.cloudinary.com/dpiuyacez/image/upload/v1740230040/profile_pic_cfeg6a.png";
export const defaultCoverPic =
  "https://res.cloudinary.com/dpiuyacez/image/upload/v1740230051/cover_pic_x5se1a.png";

const otpSchema = new Schema({
  otpType: {
    type: String,
    enum: [otpTypes.confirmEmail, otpTypes.forgetPassword],
    required: true,
  },
  code: { type: String },
  expiresIn: { type: Date },
});

const UserSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providers.system ? true : false;
      },
    },
    mobileNumber: {
      type: String,
    },
    DOB: {
      type: Date,

      validate: {
        validator: function (value) {
          return isValidDOB(value);
        },
        message: (props) => `${props.value} is not a valid date of birth!`,
      },
    },
    gender: {
      type: String,
      enum: [genders.male, genders.female],
      default: genders.male,
    },
    role: {
      type: String,
      enum: [roles.admin, roles.user],
      default: roles.user,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    freezed: {
      type: Boolean,
      default: false,
    },
    bannedAt: {
      type: Date,
    },
    updatedBy: {
      type: String,
      ref: "User",
    },
    changeCredentialTime: {
      type: Date,
    },
    provider: {
      type: String,
      enum: [...Object.values(providers)],
      default: providers.system,
    },
    profilePic: {
      secure_url: { type: String, default: defaultProfilePic },
      public_id: String,
    },
    coverPic: {
      secure_url: { type: String, default: defaultCoverPic },
      public_id: String,
    },
    OTP: [otpSchema],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//create virtual field >> userName
UserSchema.virtual("userName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.pre("save", function (next) {
  try {
    if (this.provider === providers.google) {
      next();
    } else {
      if (!this.firstName && !this.lastName) {
        this.firstName = this.email.split("@")[0];
        this.lastName = "";
      }
      if (this.password) {
        //hash password
        const hashedPassword = hashText(this.password);
        //both done before saving new user
        this.password = hashedPassword;
      }
      if (this.mobileNumber) {
        // encrypt mobile number
        const encryptedMobile = encryptText(this.mobileNumber);
        this.mobileNumber = encryptedMobile;
      }
      next();
    }
  } catch (error) {
    next(error);
  }
});

UserSchema.post("findOne", function (doc, next) {
  if (doc) {
    doc.mobileNumber = decrypt({ cypherText: doc.mobileNumber });
  }
  next();
});

UserSchema.pre("findOneAndUpdate", function () {
  this.select("-password");
});

UserSchema.post("findOneAndUpdate", function (doc, next) {
  doc.mobileNumber = decrypt({ cypherText: doc.mobileNumber });
  next();
});

export const UserModel = model("User", UserSchema);
