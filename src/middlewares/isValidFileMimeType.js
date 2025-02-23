import { fileTypeFromBuffer } from "file-type";
import fs from "fs";

export const isValidFileType = (validTypes = [""]) => {
  return async (req, res, next) => {
    const filePath = req.file.path;
    //read file and convert it to buffer
    const buffer = fs.readFileSync(filePath);
    //check file mime type

    const type = await fileTypeFromBuffer(buffer);

    if (!type || !validTypes.includes(type.mime))
      return next(new Error("invalid file mime type"));

    return next();
  };
};
