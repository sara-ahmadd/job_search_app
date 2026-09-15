import { jest } from "@jest/globals";

let { asyncHandler } = await import("../../utils/asyncHandler.js");

describe("asyncHandler() success/failure functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should call the wrapped function", async () => {
    let param = jest.fn().mockResolvedValue();

    let req = {},
      res = {},
      next = jest.fn();

    let result = asyncHandler(param);
    result(req, res, next);

    await Promise.resolve();

    expect(param).toHaveBeenCalledTimes(1);
    expect(param).toHaveBeenCalledWith(req, res, next);
  });

  test("should pass error to next", async () => {
    let error = new Error("some thing went wrong");
    let param = jest.fn().mockRejectedValue(error);

    let req = {},
      res = {},
      next = jest.fn();

    let result = asyncHandler(param);
    result(req, res, next);
    await Promise.resolve();
    expect(param).toHaveBeenCalledTimes(1);
    expect(param).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
