import Enum from "../config/Enum";
import CustomError from "./Error";

class Response {
  static successResponse(data: any, code: number = 200) {
    return {
      code,
      data,
    };
  }

  static errorResponse(error: any) {
    if (error instanceof CustomError) {
      return {
        code: error.code,
        error: {
          message: error.message,
          description: error.description,
        },
      };
    }
    
    if (error.message?.includes("E11000")) {
      return {
        code: Enum.HTTP_CODES.CONFLICT,
        error: {
          message: "Already exists",
          description: "The resource you are trying to create already exists.",
        },
      };
    }

    
    return {
      code: Enum.HTTP_CODES.INT_SERVER_ERROR,
      error: {
        message: "Unknown error",
        description: error.message || "An unexpected error occurred.",
      },
    };
  }
}

export default Response;
