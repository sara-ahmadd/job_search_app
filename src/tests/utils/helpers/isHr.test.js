import { companyRepository } from "../../../DB/repositories/index.js";
import { userRepository } from "../../../DB/repositories/index.js";
import { jest } from "@jest/globals";

const fakeUser = { _id: "123", email: "test@mail.com" };

let fakeCompany = { _id: "456", companyEmail: "company@mail.com" };

const { isHr } = await import("../../../utils/helpers/isHr.js");

describe("testing isHr() functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("isHr() should pass", async () => {
    let company = {
      ...fakeCompany,
      bannedAt: false,
      approvedByAdmin: true,
      deletedAt: false,
      createdBy: 123,
      hrs: [123],
    };
    jest.spyOn(userRepository, "findById").mockResolvedValue(fakeUser);
    jest.spyOn(companyRepository, "findById").mockResolvedValue(company);
    const socket = {
      userId: "123",
      emit: jest.fn(),
    };
    await isHr("456", socket);
    expect(socket.emit).not.toHaveBeenCalled();
    expect(userRepository.findById).toHaveBeenCalledTimes(1);
    expect(userRepository.findById).toHaveBeenCalledWith(fakeUser._id);
    expect(companyRepository.findById).toHaveBeenCalledTimes(1);
    expect(companyRepository.findById).toHaveBeenCalledWith(company._id);
  });
  test("isHr() should fail if no company passed to it", async () => {
    jest.spyOn(companyRepository, "findById").mockResolvedValue(null);

    const socket = {
      userId: "123",
      emit: jest.fn(),
    };

    await isHr(undefined, socket);

    expect(socket.emit).toHaveBeenCalledWith("error", "company not found");
  });
  test("isHr() should fail if no user passed to it", async () => {
    jest.spyOn(userRepository, "findById").mockResolvedValue(null);

    const socket = {
      userId: "123",
      emit: jest.fn(),
    };

    await isHr("234", socket);

    expect(socket.emit).toHaveBeenCalledWith("error", "user not found");
  });
  test("isHr() should fail if company.approvedByAdmin is false", async () => {
    let company = { ...fakeCompany, approvedByAdmin: undefined };
    jest.spyOn(companyRepository, "findById").mockResolvedValue(company);
    jest.spyOn(userRepository, "findById").mockResolvedValue(fakeUser);
    const socket = {
      userId: "123",
      emit: jest.fn(),
    };

    await isHr("456", socket);

    expect(socket.emit).toHaveBeenCalledWith("error", "company not approved");
  });
  test("isHr() should fail if company.bannedAt is true", async () => {
    let company = {
      ...fakeCompany,
      bannedAt: true,
      approvedByAdmin: true,
    };
    jest.spyOn(companyRepository, "findById").mockResolvedValue(company);
    jest.spyOn(userRepository, "findById").mockResolvedValue(fakeUser);
    const socket = {
      userId: "123",
      emit: jest.fn(),
    };

    await isHr("456", socket);

    expect(socket.emit).toHaveBeenCalledWith("error", "company is banned");
  });
  test("isHr() should fail if company.deletedAt is true", async () => {
    let company = {
      ...fakeCompany,
      bannedAt: false,
      approvedByAdmin: true,
      deletedAt: true,
    };
    jest.spyOn(companyRepository, "findById").mockResolvedValue(company);
    jest.spyOn(userRepository, "findById").mockResolvedValue(fakeUser);
    const socket = {
      userId: "123",
      emit: jest.fn(),
    };

    await isHr("456", socket);

    expect(socket.emit).toHaveBeenCalledWith("error", "company is deleted");
  });
  test("isHr() should pass if user is the owner of the company", async () => {
    let company = {
      ...fakeCompany,
      bannedAt: false,
      approvedByAdmin: true,
      deletedAt: false,
      createdBy: 123,
      hrs: [234],
    };
    jest.spyOn(companyRepository, "findById").mockResolvedValue(company);
    jest.spyOn(userRepository, "findById").mockResolvedValue(fakeUser);
    const socket = {
      userId: "123",
      emit: jest.fn(),
    };

    await isHr("456", socket);

    expect(socket.emit).not.toHaveBeenCalled();
  });
  test("isHr() should pass if user is an Hr in the company", async () => {
    let company = {
      ...fakeCompany,
      bannedAt: false,
      approvedByAdmin: true,
      deletedAt: false,
      createdBy: 342,
      hrs: [123],
    };
    jest.spyOn(companyRepository, "findById").mockResolvedValue(company);
    jest.spyOn(userRepository, "findById").mockResolvedValue(fakeUser);
    const socket = {
      userId: "123",
      emit: jest.fn(),
    };

    await isHr("456", socket);

    expect(socket.emit).not.toHaveBeenCalled();
  });
  test("isHr() should fail if user is neither an Hr nor the owner of the company", async () => {
    let company = {
      ...fakeCompany,
      bannedAt: false,
      approvedByAdmin: true,
      deletedAt: false,
      createdBy: 342,
      hrs: [13423],
    };
    jest.spyOn(companyRepository, "findById").mockResolvedValue(company);
    jest.spyOn(userRepository, "findById").mockResolvedValue(fakeUser);

    const socket = {
      userId: "123",
      emit: jest.fn(),
    };

    await isHr("456", socket);

    expect(socket.emit).toHaveBeenCalledWith(
      "error",
      "You cannot start this conversation",
    );
  });
});
