import { jest } from "@jest/globals";
import { sendResponse } from "../../../utils/helpers/globalResHandler";

describe("test sendResponse() functionality", () => {
  test("sendResponse() should pass if all params are correct", () => {
    let res = {
        status: jest.fn(),
        json: jest.fn(),
      },
      status = 200,
      message = "response sent",
      data = { user: { _id: "123", email: "test@mail.com" } };

    res.status.mockReturnValue(res);
    sendResponse(res, status, message, data);
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({
      status: "Success",
      message,
      data,
    });
  });
  test("sendResponse() should success response without data", () => {
    let res = {
        status: jest.fn(),
        json: jest.fn(),
      },
      status = 400,
      message = "response failed",
      data = undefined;

    res.status.mockReturnValue(res);
    sendResponse(res, status, message, data);
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({
      status: "Success",
      message,
    });
  });
});
