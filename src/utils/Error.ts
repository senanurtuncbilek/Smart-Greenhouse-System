class CustomError extends Error {
  code: number;
  description: string;

  constructor(code: number, message: string, description: string) {
    super(message);
    this.name = "CustomError";
    this.code = code;
    this.message = message;
    this.description = description;

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
