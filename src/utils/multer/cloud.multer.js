import multer from "multer";

export const fileValidators = {
  image: ["image/png", "image/jpeg", "image/gif"],
  document: ["application/pdf", "application/msword"],
};

export function cloudFileUpload({ fileValidation = [] } = {}) {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, callback) => {
    if (fileValidation.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback("in-valid file type format", false);
  };

  return multer({
    fileFilter,
    storage,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });
}
