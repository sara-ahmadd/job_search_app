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

jest.unstable_mockModule("../../../utils/hashing/hashing.js", () => ({
  compareHashedText: mockCompareHashedText,
  hashText: mockHashText,
}));

const hashedOtp =
  "$2b$10$tWvJSJ8MsRd2BJzQj7Zry.biXjfk8ObBvo1idFBjzE2tijf7yKsTK";
const mockHashText = jest.fn().mockReturnValue(hashedOtp);

const { myEventEmitter } = await import("../../../utils/emails/sendEmail");

const { otpVerificationTemplate } =
  await import("../../../utils/emails/otpVerifyEmail.js");

const { sendConfirmOtp, registerService } =
  await import("../../../modules/auth/auth.services.js");

const { confirmOtpService } =
  await import("../../../modules/auth/auth.services.js");

describe("test sendConfirmOtp() functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("sendConfirmOtp() should pass if all params are correctly passed to it", () => {
    const email = "test@mail.com",
      otpType = otpTypes.confirmEmail,
      emailSubject = "Hello, test";

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
