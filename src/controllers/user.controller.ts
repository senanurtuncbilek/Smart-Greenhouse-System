import { Request, Response } from "express";
import Users from "../db/models/Users";
import ResponseUtil from "../utils/Response";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";

const userController = {
    async register(req: Request, res: Response){
         const body = req.body;

  try {

    await Users.validateRegisterFields(body);

   
    const existingUser = await Users.findOne({ where: { email: body.email } });

    if (existingUser) {
      throw new CustomError(
        Enum.HTTP_CODES.CONFLICT,
        "Registration Error",
        "A user with this email already exists"
      );
    }

    
    const createdUser = await Users.create(body);

    return res
      .status(Enum.HTTP_CODES.CREATED)
      .json(ResponseUtil.successResponse(createdUser));
  } catch (err: any) {
    const errorResponse = ResponseUtil.errorResponse(err);
    return res.status(errorResponse.code).json(errorResponse);
  }
    },

    async add(req: Request, res: Response) {
        
    },

    async update(req: Request, res: Response){
    },
   
    async delete(req: Request, res: Response){
    }
}


export default userController;
