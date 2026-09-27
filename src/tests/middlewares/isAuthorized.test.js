import { jest } from "@jest/globals";
import { roles } from "../../../constants";
import { isAuthorized } from "../../middlewares/isAuthorized";

describe("isAuthorized() middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  let req = { body: {}, user: { email: "test@mail.com", role: roles.admin } };
  let res = {};
  let next = jest.fn();
  test("isAuthorized() should pass", async () => {
    req = { ...req, user: { email: "test@mail.com", role: roles.admin } };
    let acceptedRoles = [roles.admin];
    let auth = isAuthorized(acceptedRoles);
    await auth(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
  test("isAuthorized() should fail with unauthorized user", async () => {
    req = { ...req, user: { email: "test@mail.com", role: roles.user } };
    let acceptedRoles = [roles.admin];
    let auth = isAuthorized(acceptedRoles);
    await auth(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "user is not authorized to do this!",
      }),
    );
  });
  test("isAuthorized() should fail with no roles array passed to it", async () => {
    req = { ...req, user: { email: "test@mail.com", role: roles.user } };
    let acceptedRoles = [];
    let auth = isAuthorized(acceptedRoles);
    await auth(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "accepted roles should be provided" }),
    );
  });
  test("isAuthorized() should fail with no user found in req", async () => {
    req = { ...req, user: undefined };
    let acceptedRoles = [roles.admin];
    let auth = isAuthorized(acceptedRoles);
    await auth(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "user is not found in req object!" }),
    );
  });
});
