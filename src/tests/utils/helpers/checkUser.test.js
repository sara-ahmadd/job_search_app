import { jest } from "@jest/globals";
import { userRepository } from "../../../DB/repositories/index.js";
import {
  checkUserByEmail,
  checkUserById,
} from "../../../utils/helpers/checkUser.js";

describe("test checkUserByEmail() functionality", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  test("checkUserByEmail() should fail if user is not found", async () => {
    const user = { _id: "123", email: "test@mail.com" };
    const options = {
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    };
    const next = jest.fn();
    jest.spyOn(userRepository, "findOne").mockResolvedValue(null);
    await checkUserByEmail(user.email, next);
    expect(userRepository.findOne).toHaveBeenCalledWith(options);
    expect(next).toHaveBeenCalledWith(
      new Error("user is not found", { cause: 404 }),
    );
  });
  test("checkUserByEmail() should fail if user is banned", async () => {
    const user = {
      _id: "123",
      email: "test@mail.com",
      bannedAt: new Date("2026-02-02"),
    };
    const options = {
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    };
    const next = jest.fn();
    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
    await checkUserByEmail(user.email, next);
    expect(userRepository.findOne).toHaveBeenCalledWith(options);
    expect(next).toHaveBeenCalledWith(
      new Error("user is banned", { cause: 400 }),
    );
  });
  test("checkUserByEmail() should fail if user is not confirmed", async () => {
    const user = {
      _id: "123",
      email: "test@mail.com",
      isConfirmed: false,
    };
    const options = {
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    };
    const next = jest.fn();
    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
    await checkUserByEmail(user.email, next);
    expect(userRepository.findOne).toHaveBeenCalledWith(options);
    expect(next).toHaveBeenCalledWith(
      new Error("user is inactive", { cause: 400 }),
    );
  });
  test("checkUserByEmail() should should return the user if user is valid", async () => {
    const user = {
      _id: "123",
      email: "test@mail.com",
      isConfirmed: true,
    };
    const options = {
      email: user.email,
      freezed: false,
      deletedAt: { $exists: false },
    };
    const next = jest.fn();
    jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
    let result = await checkUserByEmail(user.email, next);
    expect(next).not.toHaveBeenCalled();
    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith(options);
    expect(result).toEqual(user);
  });
});
describe("test checkUserById() functionality", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  test("checkUserById() should fail if user is not found", async () => {
    const user = { _id: "123", email: "test@mail.com" };
    const options = {
      _id: user._id,
      freezed: false,
      deletedAt: { $exists: false },
    };
    const next = jest.fn();
    const selectedFields = "";
    const selectMock = jest.fn().mockResolvedValue(null);
    jest
      .spyOn(userRepository, "findOne")
      .mockReturnValue({ select: selectMock });
    let result = await checkUserById(user._id, next, selectedFields);
    expect(userRepository.findOne).toHaveBeenCalledWith(options);
    expect(result).toEqual(false);
  });
  test("checkUserById() should fail if user is banned", async () => {
    const user = {
      _id: "123",
      email: "test@mail.com",
      bannedAt: new Date("2026-02-02"),
    };
    const options = {
      _id: user._id,
      freezed: false,
      deletedAt: { $exists: false },
    };
    const next = jest.fn();
    const selectMock = jest.fn().mockResolvedValue(user);
    jest
      .spyOn(userRepository, "findOne")
      .mockReturnValue({ select: selectMock });
    await checkUserById(user._id, next, "");
    expect(userRepository.findOne).toHaveBeenCalledWith(options);
    expect(next).toHaveBeenCalledWith(
      new Error("user is banned", { cause: 400 }),
    );
  });
  test("checkUserById() should fail if user is not confirmed", async () => {
    const user = {
      _id: "123",
      email: "test@mail.com",
      isConfirmed: false,
    };
    const options = {
      _id: user._id,
      freezed: false,
      deletedAt: { $exists: false },
    };
    const next = jest.fn();
    const selectMock = jest.fn().mockResolvedValue(user);
    jest
      .spyOn(userRepository, "findOne")
      .mockReturnValue({ select: selectMock });
    await checkUserById(user._id, next, "");
    expect(userRepository.findOne).toHaveBeenCalledWith(options);
    expect(next).toHaveBeenCalledWith(
      new Error("user is inactive", { cause: 400 }),
    );
  });
  test("checkUserById() should should return the user if user is valid", async () => {
    const user = {
      _id: "123",
      email: "test@mail.com",
      isConfirmed: true,
    };
    const options = {
      _id: user._id,
      freezed: false,
      deletedAt: { $exists: false },
    };
    const next = jest.fn();
    const selectedFields = "";

    const selectMock = jest.fn().mockResolvedValue(user);
    jest
      .spyOn(userRepository, "findOne")
      .mockReturnValue({ select: selectMock });
    let result = await checkUserById(user._id, next, selectedFields);
    expect(next).not.toHaveBeenCalled();
    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userRepository.findOne).toHaveBeenCalledWith(options);
    expect(result).toEqual(user);
  });
});
