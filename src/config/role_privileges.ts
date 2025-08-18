export interface PrivGroup {
  id: string;
  name: string;
}

export interface Privilege {
  key: string;
  name: string;
  group: string;
  description: string;
}

export const privGroups: PrivGroup[] = [
  { id: "USERS", name: "User Permission" },
  { id: "ROLES", name: "Role Permission" },
  { id: "GREENHOUSES", name: "Greenhouse Permission" },
  { id: "ZONES", name: "Zone Permission" },
  { id: "SENSORS", name: "Sensor Permission" },
  { id: "AUTOMATIONS", name: "Automation Permission" },
  { id: "REPORTS", name: "Report Permission" },
  { id: "AUDITLOGS", name: "AuditLogs Permission" },
];

export const privileges: Privilege[] = [
  //  **USERS**
  {
    key: "user_view",
    name: "User View",
    group: "USERS",
    description: "View users",
  },
  {
    key: "user_add",
    name: "User Add",
    group: "USERS",
    description: "Add user",
  },
  {
    key: "user_update",
    name: "User Update",
    group: "USERS",
    description: "Update user",
  },
  {
    key: "user_delete",
    name: "User Delete",
    group: "USERS",
    description: "Delete user",
  },

  //  **ROLES**
  {
    key: "role_view",
    name: "Role View",
    group: "ROLES",
    description: "View roles",
  },
  {
    key: "role_add",
    name: "Role Add",
    group: "ROLES",
    description: "Add role",
  },
  {
    key: "role_update",
    name: "Role Update",
    group: "ROLES",
    description: "Update role",
  },
  {
    key: "role_delete",
    name: "Role Delete",
    group: "ROLES",
    description: "Delete role",
  },

  // **GREENHOUSES**
  {
    key: "greenhouse_view",
    name: "Greenhouse View",
    group: "GREENHOUSES",
    description: "View greenhouses",
  },
  {
    key: "greenhouse_add",
    name: "Greenhouse Add",
    group: "GREENHOUSES",
    description: "Add greenhouse",
  },
  {
    key: "greenhouse_update",
    name: "Greenhouse Update",
    group: "GREENHOUSES",
    description: "Update greenhouse",
  },
  {
    key: "greenhouse_delete",
    name: "Greenhouse Delete",
    group: "GREENHOUSES",
    description: "Delete greenhouse",
  },

  // **ZONES**
  {
    key: "zone_view",
    name: "Zone View",
    group: "ZONES",
    description: "View zones",
  },
  {
    key: "zone_add",
    name: "Zone Add",
    group: "ZONES",
    description: "Add zone",
  },
  {
    key: "zone_update",
    name: "Zone Update",
    group: "ZONES",
    description: "Update zone",
  },
  {
    key: "zone_delete",
    name: "Zone Delete",
    group: "ZONES",
    description: "Delete zone",
  },

  // **SENSORS**
  {
    key: "sensor_view",
    name: "Sensor View",
    group: "SENSORS",
    description: "View sensors",
  },
  {
    key: "sensor_add",
    name: "Sensor Add",
    group: "SENSORS",
    description: "Add sensor",
  },
  {
    key: "sensor_update",
    name: "Sensor Update",
    group: "SENSORS",
    description: "Update sensor",
  },
  {
    key: "sensor_delete",
    name: "Sensor Delete",
    group: "SENSORS",
    description: "Delete sensor",
  },

  // **AUTOMATIONS**
  {
    key: "automation_view",
    name: "Automation View",
    group: "AUTOMATIONS",
    description: "View automation rules",
  },
  {
    key: "automation_add",
    name: "Automation Add",
    group: "AUTOMATIONS",
    description: "Add automation rule",
  },
  {
    key: "automation_update",
    name: "Automation Update",
    group: "AUTOMATIONS",
    description: "Update automation rule",
  },
  {
    key: "automation_delete",
    name: "Automation Delete",
    group: "AUTOMATIONS",
    description: "Delete automation rule",
  },

  // **REPORTS**
  {
    key: "report_view",
    name: "Report View",
    group: "REPORTS",
    description: "View reports",
  },
  {
    key: "report_export",
    name: "Report Export",
    group: "REPORTS",
    description: "Export reports",
  },

  // **AUDIT LOGS**
  {
    key: "auditlogs_view",
    name: "AuditLogs View",
    group: "AUDITLOGS",
    description: "View audit logs",
  },
];
