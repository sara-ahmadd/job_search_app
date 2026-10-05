import { jest } from "@jest/globals";
import { genders, otpTypes, sendEmailEvent } from "../../../../constants";

import { userRepository } from "../../../DB/repositories/index.js";

const mockTemplate = jest.fn().mockReturnValue("HTML Text returned");
const mockGenerate = jest.fn().mockReturnValue("2ejfi");
const mockEmit = jest.fn();

jest.unstable_mockModule("otp-generator", () => ({
  generate: mockGenerate,
}));

jest.unstable_mockModule("../../../utils/emails/sendEmail", () => ({
  myEventEmitter: { emit: mockEmit },
}));

jest.unstable_mockModule("../../../utils/emails/otpVerifyEmail", () => ({
  otpVerificationTemplate: mockTemplate,
}));
const mockCompareHashedText = jest.fn();
const mockHashText = jest.fn();

jest.unstable_mockModule("../../../utils/hashing/hashing.js", () => ({
  compareHashedText: mockCompareHashedText,
  hashText: mockHashText,
}));

const hashedOtp =
  "$2b$10$tWvJSJ8MsRd2BJzQj7Zry.biXjfk8ObBvo1idFBjzE2tijf7yKsTK";

const { myEventEmitter } = await import("../../../utils/emails/sendEmail");

const { otpVerificationTemplate } =
  await import("../../../utils/emails/otpVerifyEmail.js");

const mockGenerateToken = jest.fn();

jest.unstable_mockModule("../../../utils/token/token.js", () => ({
  generateToken: mockGenerateToken,
}));
const mockcheckUserByEmail = jest.fn();
jest.unstable_mockModule("../../../utils/helpers/checkUser.js", () => ({
  checkUserByEmail: mockcheckUserByEmail,
}));

let u = {
  email: "test@gmail.com",
  firstName: "test",
  isConfirmed: true,
  lastName: "test",
  picture: "",
  profilePic: {
    public_id: null,
    secure_url: "",
  },
  email_verified: true,
};

const getPayloadMock = jest.fn();

const verifyIdTokenMock = jest.fn();

const OAuth2ClientMock = jest
  .fn()
  .mockImplementation(() => ({ verifyIdToken: verifyIdTokenMock }));

jest.unstable_mockModule("google-auth-library", () => ({
  OAuth2Client: OAuth2ClientMock,
}));
const {
  sendConfirmOtp,
  registerService,
  confirmOtpService,
  loginWithCredentialsService,
  loginWithGmailService,
} = await import("../../../modules/auth/auth.services.js");

describe("test sendConfirmOtp() functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("sendConfirmOtp() should pass if all params are correctly passed to it", () => {
    const email = "test@mail.com",
      otpType = otpTypes.confirmEmail,
      emailSubject = "Hello, test";
    mockHashText.mockReturnValue(hashedOtp);
    let result = sendConfirmOtp(email, otpType, emailSubject);

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(mockGenerate).toHaveBeenCalledWith(expect.any(Number), {
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      digits: true,
    });
    expect(mockHashText).toHaveBeenCalledTimes(1);
    expect(mockHashText).toHaveBeenCalledWith("2ejfi");
    expect(myEventEmitter.emit).toHaveBeenCalledTimes(1);
    expect(myEventEmitter.emit).toHaveBeenCalledWith(
      sendEmailEvent,
      email,
      emailSubject,
      otpVerificationTemplate("2ejfi"),
    );
    expect(result.code).toBe(hashedOtp);
    expect(result.otpType).toBe(otpType);
    expect(result.expiresIn).toBeInstanceOf(Date);
  });
  test("sendConfirmOtp() should fail if email is undefined", () => {
    const otpType = otpTypes.confirmEmail,
      emailSubject = "Hello, test";

    expect(() => sendConfirmOtp(undefined, otpType, emailSubject)).toThrow(
      "Email is undefined",
    );
  });
  test("sendConfirmOtp() should fail if otpType is undefined", () => {
    const email = "test@mail.com",
      emailSubject = "Hello, test";

    expect(() => sendConfirmOtp(email, undefined, emailSubject)).toThrow(
      "otpType is undefined",
    );
  });
  test("sendConfirmOtp() should fail if emailSubject is undefined", () => {
    const email = "test@mail.com",
      otpType = otpTypes.confirmEmail;

    expect(() => sendConfirmOtp(email, otpType, undefined)).toThrow(
      "EmailSubject is undefined",
    );
  });
});

describe("test registerService() functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  let req = { body: {} },
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() },
    next = jest.fn();
  test("registerService() should pass if all params are correctly passed to it", async () => {
    let user = {
      email: "test@mail.com",
      password: "123abcd",
      firstName: "sara",
      lastName: "test",
      DOB: new Date("1999-04-04"),
      mobileNumber: "01211221122",
      gender: genders.female,
    };
    req = {
      body: user,
    };
    jest.spyOn(userRepository, "findOne").mockResolvedValue(null);
    const otpObject = {
      code: "$2b$10$RbT2W6VPf/GVqbIkXACV3uDs/e0EEA2lNFHm12iNJ8GnB19AXDhli",
      expiresIn: "2026-09-20T12:25:03.075Z",
      otpType: "confirmEmail",
    };

    jest.spyOn(userRepository, "create").mockResolvedValue({
      ...user,
      OTP: [otpObject],
      _id: "123",
    });

    await registerService(req, res, next);

    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({ email: user.email });
    expect(userRepository.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "Success",
      message: "User registered successfully",
      data: expect.objectContaining({ _id: "123" }),
    });
  });
  test("registerService() should fail if user already exists", async () => {
    let user = {
      email: "test@mail.com",
      password: "123abcd",
      firstName: "sara",
      lastName: "test",
      DOB: new Date("1999-04-04"),
      mobileNumber: "01211221122",
      gender: genders.female,
    };
    let error = new Error("this email already exists");
    req = {
      body: user,
    };

    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
    await registerService(req, res, next);

    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({ email: user.email });
    expect(next).toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("test confirmOtpService() service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompareHashedText.mockReset();
  });
  let req = { body: {} },
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() },
    next = jest.fn();
  test("should pass with correct email & otp", async () => {
    req = { body: { email: "test@mail.com", otp: "234test" } };
    mockHashText.mockReturnValue(hashedOtp);
    let user = {
      email: "test@mail.com",
      bannedAt: null,
      OTP: [
        {
          code: "234test",
          otpType: otpTypes.confirmEmail,
          expiresIn: Date.now() + 10 * 60 * 1000,
        },
      ],
    };

    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
    jest.spyOn(userRepository, "updateOne").mockResolvedValue(user);
    mockCompareHashedText.mockReturnValue(true);

    await confirmOtpService(req, res, next);

    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.updateOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Email is confirmed successfully",
      }),
    );
    expect(mockCompareHashedText).toHaveBeenCalled();
  });
  test("should fail with expired otp", async () => {
    req = { body: { email: "test@mail.com", otp: "234test" } };
    let user = {
      email: "test@mail.com",
      bannedAt: null,
      OTP: [
        {
          code: "2340test",
          otpType: otpTypes.confirmEmail,
          expiresIn: Date.now() - 10 * 60 * 1000,
        },
      ],
    };
    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);

    await confirmOtpService(req, res, next);

    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    });
    expect(next).toHaveBeenCalledWith(new Error("otp is invalid"));
  });

  test("should fail with incorrect email", async () => {
    req = { body: { email: "test-wrong@mail.com", otp: "234test" } };

    jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

    await confirmOtpService(req, res, next);

    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      email: req.body.email,
      freezed: false,
      deletedAt: { $exists: false },
    });

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      new Error("user is not found", { cause: 404 }),
    );
  });
  test("should fail with incorrect otp", async () => {
    req = { body: { email: "test@mail.com", otp: "234test" } };
    let user = {
      email: "test@mail.com",
      OTP: [{ code: "123check", otpType: otpTypes.confirmEmail }],
    };
    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
    await confirmOtpService(req, res, next);

    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    });

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(new Error("otp is invalid"));
  });
  test("should fail with incorrect type of otp", async () => {
    req = { body: { email: "test@mail.com", otp: "234test" } };
    let user = {
      email: "test@mail.com",
      OTP: [{ code: "234test", otpType: otpTypes.forgetPassword }],
    };
    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);

    await confirmOtpService(req, res, next);

    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    });

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      new Error("no email conform otp is found", { cause: 400 }),
    );
  });
  test("should fail with user is banned", async () => {
    req = { body: { email: "test@mail.com", otp: "234test" } };
    let user = {
      email: "test@mail.com",
      bannedAt: new Date("2026-09-11"),
    };
    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);

    await confirmOtpService(req, res, next);

    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    });

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      new Error("user is banned", { cause: 404 }),
    );
  });
});

describe("test loginWithCredentialsService() service", () => {
  let req = { body: { password: "123-password", email: "sara@mail.com" } },
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() },
    next = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should pass if user exists with same credintials", async () => {
    const userLogin = {
      email: "sara@mail.com",
      password: "123-password",
      freezed: false,
      isConfirmed: true,
      _id: "123",
      bannedAt: undefined,
    };
    mockcheckUserByEmail.mockReturnValue(userLogin);

    mockCompareHashedText.mockReturnValue(true);
    await loginWithCredentialsService(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockGenerateToken).toHaveBeenCalled();
    expect(mockGenerateToken).toHaveBeenNthCalledWith(
      1,
      { id: userLogin._id, email: userLogin.email },
      process.env.ACCESS_EXPIRY_TIME,
    );
    expect(mockGenerateToken).toHaveBeenNthCalledWith(
      2,
      { id: userLogin._id, email: userLogin.email },
      process.env.REFRESH_EXPIRY_TIME,
    );
    expect(mockGenerateToken).toHaveBeenCalledTimes(2);
  });
  test("should fail if user is not confirmed", async () => {
    const userLogin = {
      email: "sara@mail.com",
      password: "123-password",
      freezed: false,
      isConfirmed: false,
      bannedAt: undefined,
    };
    mockcheckUserByEmail.mockReturnValue(userLogin);
    await loginWithCredentialsService(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "user is inactive" }),
    );
  });
  test("should fail if user is freezed", async () => {
    const userLogin = {
      email: "sara@mail.com",
      password: "123-password",
      freezed: true,
      isConfirmed: true,
      bannedAt: undefined,
    };
    mockcheckUserByEmail.mockResolvedValue(userLogin);
    await loginWithCredentialsService(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "user is inactive" }),
    );
  });
  test("should fail if passwords mismatch", async () => {
    const userLogin = {
      email: "sara@mail.com",
      password: "123-password-123",
      freezed: false,
      isConfirmed: true,
      bannedAt: undefined,
    };
    mockcheckUserByEmail.mockResolvedValue(userLogin);
    mockCompareHashedText.mockReturnValue(false);

    await loginWithCredentialsService(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Credentials are invalid" }),
    );
  });
});
describe("test loginWithGmailService() service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  let req = { body: { idToken: "" } };
  let res = { status: jest.fn().mockReturnThis(), json: jest.fn() },
    next = jest.fn();
  test("should pass with all params correct", async () => {
    const clientId = process.env.CLIENT_ID;

    getPayloadMock.mockReturnValue(u);

    verifyIdTokenMock.mockResolvedValue({
      getPayload: getPayloadMock,
    });
    jest.spyOn(userRepository, "findOne").mockResolvedValue(null);
    jest
      .spyOn(userRepository, "create")
      .mockResolvedValue({ ...u, _id: "123" });

    await loginWithGmailService(req, res, next);
    expect(OAuth2ClientMock).toHaveBeenCalledWith(clientId);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      email: u.email,
      isConfirmed: true,
    });
    expect(userRepository.create).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalledWith();
  });

  test("should fail if user email isnot verified", async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: getPayloadMock,
    });

    getPayloadMock.mockReturnValue({ ...u, email_verified: false });

    await loginWithGmailService(req, res, next);
    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "invalid email" }),
    );
  });
  test("should fail if google token is invalid", async () => {
    const error = new Error("Invalid Google token");

    verifyIdTokenMock.mockRejectedValue(error);

    await loginWithGmailService(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
  test("should fail if google payload is missing", async () => {
    getPayloadMock.mockReturnValue(undefined);

    verifyIdTokenMock.mockResolvedValue({
      getPayload: getPayloadMock,
    });

    await expect(loginWithGmailService(req, res, next)).rejects.toThrow();
  });
});
