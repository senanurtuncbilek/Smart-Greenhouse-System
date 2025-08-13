import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../sequelize';

class UserRole extends Model<InferAttributes<UserRole>, InferCreationAttributes<UserRole>> {
  declare user_id: number;
  declare role_id: number;
}

UserRole.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    modelName: 'UserRole',
    timestamps: false,
  }
);

export default UserRole;
