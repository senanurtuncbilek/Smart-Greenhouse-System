import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../sequelize";

export enum RuleStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  TESTING = "testing"
}

export enum RulePriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

class AutomationRule extends Model<
  InferAttributes<AutomationRule>,
  InferCreationAttributes<AutomationRule>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: CreationOptional<string>;
  declare zone_id: number;
  declare status: RuleStatus;
  declare priority: RulePriority;
  declare conditions: any; // JSON field for conditions
  declare actions: any; // JSON field for actions
  declare active_hours_start: CreationOptional<string>;
  declare active_hours_end: CreationOptional<string>;
  declare is_active: boolean;
  declare created_by: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

AutomationRule.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RuleStatus)),
      allowNull: false,
      defaultValue: RuleStatus.ACTIVE,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(RulePriority)),
      allowNull: false,
      defaultValue: RulePriority.MEDIUM,
    },
    conditions: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    actions: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    active_hours_start: {
      type: DataTypes.STRING(5), // HH:MM format
      allowNull: true,
    },
    active_hours_end: {
      type: DataTypes.STRING(5), // HH:MM format
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "automation_rules",
    modelName: "AutomationRule",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["zone_id"] },
      { fields: ["status"] },
      { fields: ["priority"] },
      { fields: ["is_active"] },
      { fields: ["created_by"] },
    ],
  }
);

export default AutomationRule;
