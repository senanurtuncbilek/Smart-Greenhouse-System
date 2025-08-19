import User from "./Users";
import Role from "./Roles";
import UserRole from "./UserRole";
import RolePrivilege from "./RolePrivileges";
import Greenhouse from "./Greenhouses";
import Zone from "./Zones";
import Sensor from "./Sensors";
import SensorReading from "./SensorReadings";

User.hasMany(UserRole, {
  as: "userRoles",
  foreignKey: { name: "user_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
UserRole.belongsTo(User, {
  as: "user",
  foreignKey: { name: "user_id", allowNull: false },
});

Role.hasMany(UserRole, {
  as: "roleUsers",
  foreignKey: { name: "role_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
UserRole.belongsTo(Role, {
  as: "role",
  foreignKey: { name: "role_id", allowNull: false },
});
// User ↔ Role (created_by)
User.hasMany(Role, {
  as: "createdRoles",
  foreignKey: { name: "created_by", allowNull: true },
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Role.belongsTo(User, {
  as: "creator",
  foreignKey: { name: "created_by", allowNull: true },
});

// M:N
User.belongsToMany(Role, {
  through: UserRole,
  as: "roles", // user.roles / user.getRoles()
  foreignKey: "user_id",
  otherKey: "role_id",
});
Role.belongsToMany(User, {
  through: UserRole,
  as: "users", // role.users / role.getUsers()
  foreignKey: "role_id",
  otherKey: "user_id",
});

//
// Role ↔ RolePrivilege (1:N)
//
Role.hasMany(RolePrivilege, {
  as: "privileges", // role.privileges / role.getPrivileges()
  foreignKey: { name: "role_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
RolePrivilege.belongsTo(Role, {
  as: "role",
  foreignKey: { name: "role_id", allowNull: false },
});

//
// User ↔ RolePrivilege (created_by) (1:N)
//
User.hasMany(RolePrivilege, {
  as: "createdPrivileges",
  foreignKey: { name: "created_by", allowNull: true },
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
RolePrivilege.belongsTo(User, {
  as: "createdBy",
  foreignKey: { name: "created_by", allowNull: true },
});

//
// User ↔ Greenhouse (1:N)
//
User.hasMany(Greenhouse, {
  as: "greenhouses",
  foreignKey: { name: "user_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Greenhouse.belongsTo(User, {
  as: "owner",
  foreignKey: { name: "user_id", allowNull: false },
});

//
// Greenhouse ↔ Zone (1:N)
//
Greenhouse.hasMany(Zone, {
  as: "zones",
  foreignKey: { name: "greenhouse_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Zone.belongsTo(Greenhouse, {
  as: "greenhouse",
  foreignKey: { name: "greenhouse_id", allowNull: false },
});

// Zone ↔ Sensor (1:N)
Zone.hasMany(Sensor, {
  as: "sensors",
  foreignKey: { name: "zone_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Sensor.belongsTo(Zone, {
  as: "zone",
  foreignKey: { name: "zone_id", allowNull: false },
});

// Sensor ↔ SensorReading (1:N)
Sensor.hasMany(SensorReading, {
  as: "readings",
  foreignKey: { name: "sensor_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
SensorReading.belongsTo(Sensor, {
  as: "sensor",
  foreignKey: { name: "sensor_id", allowNull: false },
});

export { User, Role, UserRole, RolePrivilege, Greenhouse, Zone };
