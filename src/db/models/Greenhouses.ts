import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../sequelize";

class Greenhouse extends Model<
  InferAttributes<Greenhouse>,
  InferCreationAttributes<Greenhouse>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare user_id: number;
  declare location: string;
  declare created_at: CreationOptional<Date>;
}

Greenhouse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "_id",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "greenhouses",
    modelName: "Greenhouse",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "name"],
        name: "uniq_user_greenhouse_name",
      },
      { fields: ["user_id"] },
    ],
  }
);

export default Greenhouse;
