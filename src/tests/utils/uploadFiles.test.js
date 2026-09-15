import { jest } from "@jest/globals";
const multerMock = jest.fn();
const diskStorageMock = jest.fn();

jest.unstable_mockModule("multer", () => ({
  default: multerMock,
  diskStorage: diskStorageMock,
}));

const { upload } = await import("../../utils/deskUpload.js");

describe("upload file to disk storage", () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  test("upload() should upload a file successfully", () => {
    let dest = "/mock/dest";
    upload(dest);
    expect(multerMock).toHaveBeenCalled();
    expect(diskStorageMock).toHaveBeenCalled();
  });

  test("upload should upload a file successfully", () => {
    // recognize dependencies : diskStorage(), multer(), storageConfig
    const storageConfig = {
      destination: jest.fn(),
      filename: jest.fn(),
    };

    diskStorageMock(storageConfig);
    multerMock({ storage: { dest: "./public/data/uploads/" } });
    expect(diskStorageMock).toHaveBeenCalled();
    expect(diskStorageMock).toHaveBeenCalledWith(storageConfig);
    expect(multerMock).toHaveBeenCalled();
    expect(multerMock).toHaveBeenCalledWith({
      storage: { dest: "./public/data/uploads/" },
    });
  });
});
