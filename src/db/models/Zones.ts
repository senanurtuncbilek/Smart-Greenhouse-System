import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from '@sequelize/core';
import sequelize from '../sequelize';

class Zone extends Model<
  InferAttributes<Zone>,
  InferCreationAttributes<Zone>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare greenhouse_id: number;
}

Zone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: '_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    greenhouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'zones',
    modelName: 'Zone',
    timestamps: false,
  }
);

export default Zone;
