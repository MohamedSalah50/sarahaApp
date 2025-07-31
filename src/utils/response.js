export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
      return res.status(500).json({
        error_message: "server error",
        error,
        message: error.message,
        stack: error.stack,
      });
    });
  };
};

export const globalErrorHandling = (err, req, res, next) => {
  return res
    .status(err.cause || 400)
    .json({ message: err.message, stack: err.stack });
};

export const successResponse = ({
  res,
  message = "done",
  status = 200,
  data = {},
}) => {
  return res.status(status).json({ message, data });
};
