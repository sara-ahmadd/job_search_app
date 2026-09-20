import { jest } from "@jest/globals";
import { userRepository } from "../../../DB/repositories";
import { otpTypes } from "../../../../constants";

const { deleteExpiredOtps } =
  await import("../../../utils/helpers/deleteExpiredOtps");

describe("test deleteExpiredOtps() functionality", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  test("deleteExpiredOtps() should pass", async () => {
    let users = [
      {
        _id: "123",
        email: "test@mail.com",
        OTP: [
          {
            otpType: {
              type: String,
              enum: [otpTypes.confirmEmail, otpTypes.forgetPassword],
              required: true,
            },
            code: "test",
            expiresIn: new Date("2026-09-11"),
          },
        ],
      },
    ];

    jest.spyOn(userRepository, "updateMany").mockResolvedValue(users);

    let result = await deleteExpiredOtps();
    expect(result).toEqual(users);
  });
  test("deleteExpiredOtps() should fail if expreation date of otp is undefined", async () => {
    let error = new Error("database error");

    jest.spyOn(userRepository, "updateMany").mockRejectedValue(error);

    await expect(deleteExpiredOtps()).rejects.toThrow("database error");
  });
});
