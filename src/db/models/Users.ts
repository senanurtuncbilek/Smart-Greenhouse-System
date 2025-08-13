import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../sequelize";
import * as yup from "yup";
import Enum from "../../config/Enum";
import CustomError from "../../utils/Error";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare phone_number: string | null;
  declare is_active: boolean;
  declare created_at: CreationOptional<Date>;
  static getBaseUserSchema() {
    return yup.object({
      email: yup.string().email("Invalid email format"),
      password: yup
        .string()
        .min(
          Enum.USER.PASSWORD_LENGTH,
          `Password must be at least ${Enum.USER.PASSWORD_LENGTH} characters`
        ),
      first_name: yup.string(),
      last_name: yup.string(),
      phone_number: yup
        .string()
        .nullable()
        .matches(
          /^\+[1-9]\d{1,14}$/,
          "Phone number must be in international E.164 format"
        ),
      is_active: yup.boolean(),
    });
  }

  static async validateRegisterFields(data: any) {
    const schema = this.getBaseUserSchema().shape({
      email: yup.string().required("Email is required"),
      password: yup
        .string()
        .required("Password is required")
        .min(
          Enum.USER.PASSWORD_LENGTH,
          `Password must be at least ${Enum.USER.PASSWORD_LENGTH} characters`
        ),
      first_name: yup.string().required("First name is required"),
      last_name: yup.string().required("Last name is required"),
    });

    try {
      await schema.validate(data);
    } catch (err: any) {
      throw new CustomError(400, "Validation Error", err.message);
    }
  }

  static async validateUpdateFields(data: any) {
    const schema = this.getBaseUserSchema();

    try {
      await schema.validate(data);
    } catch (err: any) {
      throw new CustomError(400, "Validation Error", err.message);
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "_id",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: false,
  }
);

export default User;
