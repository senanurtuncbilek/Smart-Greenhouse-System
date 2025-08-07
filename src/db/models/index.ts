import User from './Users';
import Role from './Roles';
import UserRole from './UserRole';
import RolePrivilege from './RolePrivileges';
import Greenhouse from './Greenhouses';
import Zone from './Zones';

// User ↔ UserRole
User.hasMany(UserRole, { foreignKey: 'user_id' });
UserRole.belongsTo(User, { foreignKey: 'user_id' });

// Role ↔ UserRole
Role.hasMany(UserRole, { foreignKey: 'role_id' });
UserRole.belongsTo(Role, { foreignKey: 'role_id' });

// Role ↔ RolePrivilege
Role.hasMany(RolePrivilege, { foreignKey: 'role_id' });
RolePrivilege.belongsTo(Role, { foreignKey: 'role_id' });

// User ↔ RolePrivilege (created_by)
User.hasMany(RolePrivilege, { foreignKey: 'created_by' });
RolePrivilege.belongsTo(User, { foreignKey: 'created_by' });

// User ↔ Greenhouse
User.hasMany(Greenhouse, { foreignKey: 'user_id' });
Greenhouse.belongsTo(User, { foreignKey: 'user_id' });

// Greenhouse ↔ Zone
Greenhouse.hasMany(Zone, { foreignKey: 'greenhouse_id' });
Zone.belongsTo(Greenhouse, { foreignKey: 'greenhouse_id' });

export {
  User,
  Role,
  UserRole,
  RolePrivilege,
  Greenhouse,
  Zone,
};
