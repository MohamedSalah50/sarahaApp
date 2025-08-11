import multer from "multer";
import fs from "fs";
import path from "path";

export const fileValidators = {
  image: ["image/png", "image/jpeg", "image/gif"],
  document: ["application/pdf", "application/msword"],
};

export function localFileUpload({
  customPath = "general",
  fileValidation = [],
} = {}) {
  let basePath = `uploads/${customPath}`;
  let fullPath = path.resolve(`./src/${basePath}`);

  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      if (req.user?._id) {
        basePath += `/${req.user._id.toString()}`;
        fullPath = path.resolve(`./src/${basePath}`);
      }

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      callback(null, fullPath);
    },

    filename: function (req, file, callback) {
      // console.log({ file });
      const uniqueFileName =
        Date.now() + "_" + Math.random() + "_" + file.originalname;

      file.finalPath = basePath + "/" + uniqueFileName;

      callback(null, uniqueFileName);
    },
  });

  const fileFilter = (req, file, callback) => {
    // console.log(file);
    // console.log(fileValidation.includes(file.mimetype));

    if (!fileValidation.includes(file.mimetype)) {
      return callback("in-valid file type", false);
    }
    callback(null, true);
  };

  return multer({
    dest: "temp",
    fileFilter,
    storage,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });
}
