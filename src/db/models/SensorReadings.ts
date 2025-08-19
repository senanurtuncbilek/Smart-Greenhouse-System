import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../sequelize";

class SensorReading extends Model<
  InferAttributes<SensorReading>,
  InferCreationAttributes<SensorReading>
> {
  declare id: CreationOptional<number>;
  declare sensor_id: number;
  declare value: number;
  declare unit: string;
  declare timestamp: Date;
  declare is_anomaly: boolean;
  declare anomaly_score: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
}

SensorReading.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sensor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_anomaly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    anomaly_score: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "sensor_readings",
    modelName: "SensorReading",
    timestamps: false,
    indexes: [
      { fields: ["sensor_id"] },
      { fields: ["timestamp"] },
      { fields: ["is_anomaly"] },
      { fields: ["sensor_id", "timestamp"] },
    ],
  }
);

export default SensorReading;
