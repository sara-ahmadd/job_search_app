import { jest } from "@jest/globals";
import { userRepository } from "../../DB/repositories";

let verifyTokenMock = jest.fn().mockReturnValue({ id: "123" });
let decodeMock = jest.fn().mockReturnValue({
  iat: new Date(Date.now() - 20 * 60 * 1000).getTime() / 1000,
});

jest.unstable_mockModule("../../utils/token/token", () => ({
  verifyToken: verifyTokenMock,
}));
jest.mock("jsonwebtoken", () => ({ decode: decodeMock }));
const { isAuthenticated } = await import("../../middlewares/isAuthenticated");

describe("isAuthenticated()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should pass with all correct params", async () => {
    let req = { body: {}, headers: { authorization: "Bearer dflmbdkl" } },
      res = {},
      next = jest.fn();
    let user = { _id: "123", email: "test@mail.com" };
    jest.spyOn(userRepository, "findById").mockResolvedValue(user);
    await isAuthenticated(req, res, next);
    expect(userRepository.findById).toHaveBeenCalledWith("123");
    expect(verifyTokenMock).toHaveBeenCalledWith("dflmbdkl");
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(user);
  });
  test("should fail if req has no authorization key", async () => {
    let req = { body: {}, headers: { authorization: null } },
      res = {},
      next = jest.fn();

    await isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalledWith(new Error("User is unauthenticated"));
  });
  test("should fail if req has no token", async () => {
    let req = { body: {}, headers: { authorization: "abcde" } },
      res = {},
      next = jest.fn();

    await isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalledWith(new Error("Token is required"));
  });
  test("should fail if user is not found", async () => {
    let req = { body: {}, headers: { authorization: "Bearer dflmbdkl" } },
      res = {},
      next = jest.fn();

    jest.spyOn(userRepository, "findById").mockResolvedValue(null);
    await isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalledWith(new Error("User is not found"));
  });
  test("should fail if user is freezed", async () => {
    let req = { body: {}, headers: { authorization: "Bearer dflmbdkl" } },
      res = {},
      next = jest.fn();
    let user = { _id: "123", email: "test@mail.com", freezed: true };

    jest.spyOn(userRepository, "findById").mockResolvedValue(user);
    await isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalledWith(new Error("User is deleted"));
  });
  test("should fail if user is banned", async () => {
    let req = { body: {}, headers: { authorization: "Bearer dflmbdkl" } },
      res = {},
      next = jest.fn();
    let user = { _id: "123", email: "test@mail.com", bannedAt: Date.now() };

    jest.spyOn(userRepository, "findById").mockResolvedValue(user);
    await isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalledWith(new Error("User is banned"));
  });
  test("should fail : if token is created before password changed, return response : you must login first", async () => {
    let req = { body: {}, headers: { authorization: "Bearer dflmbdkl" } },
      res = {},
      next = jest.fn();
    let user = {
      _id: "123",
      email: "test@mail.com",
      changeCredentialTime: new Date(Date.now() - 10 * 60 * 1000),
    };

    jest.spyOn(userRepository, "findById").mockResolvedValue(user);
    await isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalledWith(new Error("you must login first"));
    expect(decodeMock).toHaveBeenCalledWith("dflmbdkl");
  });
  test("should pass : if token is created after password changed", async () => {
    let req = { body: {}, headers: { authorization: "Bearer dflmbdkl" } },
      res = {},
      next = jest.fn();
    let user = {
      _id: "123",
      email: "test@mail.com",
      changeCredentialTime: new Date(Date.now() - 40 * 60 * 1000),
    };

    jest.spyOn(userRepository, "findById").mockResolvedValue(user);
    await isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(decodeMock).toHaveBeenCalledWith("dflmbdkl");
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
