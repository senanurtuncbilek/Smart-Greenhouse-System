import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../sequelize";

export enum SensorType {
  TEMPERATURE = "temperature",
  HUMIDITY = "humidity",
  SOIL_MOISTURE = "soil_moisture",
  LIGHT_LEVEL = "light_level",
  PH = "ph",
  CO2 = "co2"
}

export enum SensorStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  ERROR = "error"
}

class Sensor extends Model<
  InferAttributes<Sensor>,
  InferCreationAttributes<Sensor>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare type: SensorType;
  declare zone_id: number;
  declare status: SensorStatus;
  declare location: string;
  declare calibration_date: CreationOptional<Date>;
  declare last_reading: CreationOptional<Date>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Sensor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(SensorType)),
      allowNull: false,
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SensorStatus)),
      allowNull: false,
      defaultValue: SensorStatus.ACTIVE,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calibration_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_reading: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "sensors",
    modelName: "Sensor",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["zone_id"] },
      { fields: ["type"] },
      { fields: ["status"] },
    ],
  }
);

export default Sensor;
