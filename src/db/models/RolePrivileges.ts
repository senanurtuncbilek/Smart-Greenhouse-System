import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../sequelize';

class RolePrivilege extends Model<InferAttributes<RolePrivilege>, InferCreationAttributes<RolePrivilege>> {
  declare id: CreationOptional<number>;
  declare role_id: number;
  declare permission: string;
  declare created_by: number | null;
}

RolePrivilege.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'role_privileges',
    modelName: 'RolePrivilege',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default RolePrivilege;
