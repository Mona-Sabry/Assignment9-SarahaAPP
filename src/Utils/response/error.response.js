export const ErrorResponse = ({
  message = "Error",
  status = 400,
  extra = undefined,
}) => {
  const error = new Error(
    typeof message === "string" ? message : message?.message,
  );
  error.status = status;
  error.extra = extra;
  throw error;
};

export const BadRequestException = ({
  message = "Bad Request Exception",
  extra,
}) => {
  return ErrorResponse({ message, status: 400, extra });
};

export const ConflictException = ({
 message = "Conflic Exception",
  extra,
 }) => {
  return ErrorResponse({ message, status: 409, extra });
};

export const NotFoundException = ({
  message = "Not Found Exception",
  extra,
}) => {
  return ErrorResponse({ message, status: 404, extra });
};

export const ForbidenException = ({
  message = "Forbiden Exception",
  extra,
}) => {
  return ErrorResponse({ message, status: 403, extra });
};

export const UnauthorizedException = ({
  message = "Unauthorized Exception",
  extra,
}) => {
  return ErrorResponse({ message, status: 401, extra });
};


export const globalErrorHandler = (err, req , res , next)=>{
    const status = err.status?? 500;
    const extra = err.extra || undefined;
    return res.status( status).json({message:err.message,stack:err.stack , extra});   
};

