import { jest } from "@jest/globals";
// import multer from "multer";
const multerMock = jest.fn();
const diskStorageMock = jest.fn();

jest.unstable_mockModule("multer", () => ({
  default: multerMock,
  diskStorage: diskStorageMock,
}));

const { uploadCloudinary } = await import("../../utils/cloudUpload.js");

describe("test cloud upload to cloudinary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should call test storage with empty config", () => {
    uploadCloudinary();
    expect(diskStorageMock).toHaveBeenCalledTimes(1);
    expect(diskStorageMock).toHaveBeenCalledWith({});
  });

  test("should pass the storage to multer", () => {
    let storage = jest.fn();
    diskStorageMock.mockReturnValue(storage);
    uploadCloudinary();
    expect(multerMock).toHaveBeenCalledTimes(1);
    expect(multerMock).toHaveBeenCalledWith({ storage });
  });

  test("uploadCloudinary() should return multer", () => {
    let uploadFile = jest.fn();
    multerMock.mockReturnValue(uploadFile);

    let result = uploadCloudinary();

    expect(result).toBe(uploadFile);
    expect(multerMock).toHaveBeenCalledTimes(1);
    expect(diskStorageMock).toHaveBeenCalledTimes(1);
  });
});
