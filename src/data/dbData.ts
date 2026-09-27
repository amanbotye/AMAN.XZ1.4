// Auto-extracted and verified from AMAN repository & Supabase live export

export interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
}

export interface PolicyDef {
  name: string;
  command: string;
  using: string | null;
  check: string | null;
}

export interface ForeignKeyDef {
  column: string;
  refTable: string;
  refColumn: string;
}

export interface TableDef {
  name: string;
  columnCount: number;
  columns: ColumnDef[];
  policies: PolicyDef[];
  foreignKeys: ForeignKeyDef[];
}

export interface RpcDef {
  name: string;
  arguments: string;
  returnType: string;
  isSecurityDefiner: boolean;
  definition: string;
}

export const REPO_INFO = {
  repoUrl: 'https://github.com/amanbotye/AMAN.XZ1.4.git',
  branch: 'main',
  latestCommit: 'cae15bf83d39fb80dd466d85a41a22089562567b',
  author: 'amanbotye <aman.bot.ye@gmail.com>',
  commitDate: '2026-09-28 01:19:16 +0300',
  files: [
    { name: 'AMAN_XZ1_4.txt', size: '368 KB', desc: 'الملف المرجعي الشامل للمواصفة الوظيفية (8,334+ سطر مقسم لـ 8 مراحل متكاملة)' },
    { name: 'Supabase Snippet Untitled query New.csv', size: '256 KB', desc: 'مخرجات استعلام استخراج بنية قاعدة البيانات الحية المحدثة من Supabase' },
    { name: 'AMAN_DB_CORRECTIVE_MIGRATION.sql', size: '34 KB', desc: 'مخطط التعديل التصحيحي للدفاع في العمق والعمليات الموثوقة ومحاذاة الصلاحيات' }
  ]
};

export const DB_TABLES: TableDef[] = [
  {
    "name": "admin_notifications",
    "columnCount": 11,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "notification_type",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "title",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "body",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "related_request_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "related_protection_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "related_task_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "is_read",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "read_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "an_insert_admin",
        "command": "INSERT",
        "using": null,
        "check": "true"
      },
      {
        "name": "an_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "an_update_admin",
        "command": "UPDATE",
        "using": "is_admin()",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "related_protection_id",
        "refTable": "protections",
        "refColumn": "id"
      },
      {
        "column": "related_request_id",
        "refTable": "protection_requests",
        "refColumn": "id"
      },
      {
        "column": "related_task_id",
        "refTable": "protection_tasks",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "audit_logs",
    "columnCount": 9,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "actor_user_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "action",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "entity_type",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "entity_id",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "old_data",
        "type": "jsonb",
        "nullable": true,
        "default": null
      },
      {
        "name": "new_data",
        "type": "jsonb",
        "nullable": true,
        "default": null
      },
      {
        "name": "metadata",
        "type": "jsonb",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "audit_insert_any",
        "command": "INSERT",
        "using": null,
        "check": "true"
      },
      {
        "name": "audit_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "actor_user_id",
        "refTable": "users",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "client_notifications",
    "columnCount": 12,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "user_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "notification_type",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "title",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "body",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "related_request_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "related_protection_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "related_task_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "is_read",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "read_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "cn_notif_insert_admin",
        "command": "INSERT",
        "using": null,
        "check": "is_admin()"
      },
      {
        "name": "cn_notif_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "cn_notif_select_own",
        "command": "SELECT",
        "using": "(user_id = auth.uid())",
        "check": null
      },
      {
        "name": "cn_notif_update_own",
        "command": "UPDATE",
        "using": "(user_id = auth.uid())",
        "check": "(user_id = auth.uid())"
      }
    ],
    "foreignKeys": [
      {
        "column": "related_protection_id",
        "refTable": "protections",
        "refColumn": "id"
      },
      {
        "column": "related_request_id",
        "refTable": "protection_requests",
        "refColumn": "id"
      },
      {
        "column": "related_task_id",
        "refTable": "protection_tasks",
        "refColumn": "id"
      },
      {
        "column": "user_id",
        "refTable": "users",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "companies",
    "columnCount": 10,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "name_ar",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "name_en",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "code",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "description",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "display_order",
        "type": "integer",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "is_active",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "companies_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "companies_select_all",
        "command": "SELECT",
        "using": "((is_active = true) AND (is_deleted = false))",
        "check": null
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "company_packages",
    "columnCount": 13,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "name_ar",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "name_en",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "description",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "price",
        "type": "numeric",
        "nullable": false,
        "default": null
      },
      {
        "name": "currency",
        "type": "text",
        "nullable": false,
        "default": "'YER'::text"
      },
      {
        "name": "duration_days",
        "type": "integer",
        "nullable": false,
        "default": null
      },
      {
        "name": "is_active",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "is_visible",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "packages_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "packages_select_customer",
        "command": "SELECT",
        "using": "((is_active = true) AND (is_visible = true) AND (is_deleted = false))",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "company_prefixes",
    "columnCount": 8,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "prefix",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "number_length",
        "type": "integer",
        "nullable": true,
        "default": null
      },
      {
        "name": "is_active",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "prefixes_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "prefixes_select_all",
        "command": "SELECT",
        "using": "((is_active = true) AND (is_deleted = false))",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "company_subscription_settings",
    "columnCount": 11,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "renewal_enabled",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "renewal_visibility_days",
        "type": "integer",
        "nullable": false,
        "default": "30"
      },
      {
        "name": "expiry_notifications_enabled",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "notify_days_before_expiry",
        "type": "integer",
        "nullable": false,
        "default": "7"
      },
      {
        "name": "allow_task_after_expiry",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "max_task_days_after_expiry",
        "type": "integer",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "expiry_extension_rules",
        "type": "jsonb",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "sub_settings_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "sub_settings_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "company_subscription_status_configs",
    "columnCount": 15,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "status_code",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "display_name_ar",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "display_name_en",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "min_days_remaining",
        "type": "integer",
        "nullable": true,
        "default": null
      },
      {
        "name": "max_days_remaining",
        "type": "integer",
        "nullable": true,
        "default": null
      },
      {
        "name": "display_order",
        "type": "integer",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "is_visible",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "notify_enabled",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "notify_message_ar",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "is_active",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "sub_status_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "sub_status_select_all",
        "command": "SELECT",
        "using": "((is_active = true) AND (is_deleted = false))",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "company_task_settings",
    "columnCount": 17,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "task_amount",
        "type": "numeric",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "task_currency",
        "type": "text",
        "nullable": false,
        "default": "'YER'::text"
      },
      {
        "name": "task_interval_days",
        "type": "integer",
        "nullable": false,
        "default": "30"
      },
      {
        "name": "enable_first_task",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "enable_recurring_tasks",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "due_visibility_days",
        "type": "integer",
        "nullable": false,
        "default": "7"
      },
      {
        "name": "completed_retention_days",
        "type": "integer",
        "nullable": false,
        "default": "30"
      },
      {
        "name": "overdue_retention_days",
        "type": "integer",
        "nullable": false,
        "default": "90"
      },
      {
        "name": "scheduled_retention_days",
        "type": "integer",
        "nullable": false,
        "default": "365"
      },
      {
        "name": "allow_reschedule",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "allow_after_expiry",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "max_days_after_expiry",
        "type": "integer",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "is_active",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "task_settings_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "task_settings_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "company_task_status_configs",
    "columnCount": 12,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "status_code",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "display_name_ar",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "display_name_en",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "display_order",
        "type": "integer",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "retention_days",
        "type": "integer",
        "nullable": true,
        "default": null
      },
      {
        "name": "is_visible",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "is_active",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "task_configs_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "task_configs_select_all",
        "command": "SELECT",
        "using": "(is_active = true)",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "customer_numbers",
    "columnCount": 11,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "customer_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "phone_number",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "normalized_phone_number",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "detected_prefix",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "status",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": "'active'::number_status_enum"
      },
      {
        "name": "notes",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "cn_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "cn_select_own",
        "command": "SELECT",
        "using": "((customer_id = auth.uid()) AND (is_deleted = false))",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      },
      {
        "column": "customer_id",
        "refTable": "users",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "manual_payment_logs",
    "columnCount": 11,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "request_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "renewal_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "payment_method_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "transfer_reference",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "amount",
        "type": "numeric",
        "nullable": true,
        "default": null
      },
      {
        "name": "verification_status",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": "'pending'::payment_verification_status_enum"
      },
      {
        "name": "verified_by",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "verified_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "verification_note",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "mpl_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "payment_method_id",
        "refTable": "payment_methods",
        "refColumn": "id"
      },
      {
        "column": "renewal_id",
        "refTable": "protection_renewals",
        "refColumn": "id"
      },
      {
        "column": "request_id",
        "refTable": "protection_requests",
        "refColumn": "id"
      },
      {
        "column": "verified_by",
        "refTable": "users",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "payment_methods",
    "columnCount": 12,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "name_ar",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "name_en",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "code",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "instructions",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "account_name",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "account_identifier",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "display_order",
        "type": "integer",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "is_active",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "pm_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "pm_select_active",
        "command": "SELECT",
        "using": "((is_active = true) AND (is_deleted = false))",
        "check": null
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "protection_renewals",
    "columnCount": 17,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "protection_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "customer_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "package_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "price_snapshot",
        "type": "numeric",
        "nullable": true,
        "default": null
      },
      {
        "name": "currency_snapshot",
        "type": "text",
        "nullable": true,
        "default": "'YER'::text"
      },
      {
        "name": "duration_days_snapshot",
        "type": "integer",
        "nullable": true,
        "default": null
      },
      {
        "name": "previous_end_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "new_end_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "payment_method_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "payment_transfer_reference",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "status",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": "'pending'::renewal_status_enum"
      },
      {
        "name": "rejection_reason",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "reviewed_by",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "reviewed_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "renewal_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "renewal_select_own",
        "command": "SELECT",
        "using": "(customer_id = auth.uid())",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "customer_id",
        "refTable": "users",
        "refColumn": "id"
      },
      {
        "column": "package_id",
        "refTable": "company_packages",
        "refColumn": "id"
      },
      {
        "column": "payment_method_id",
        "refTable": "payment_methods",
        "refColumn": "id"
      },
      {
        "column": "protection_id",
        "refTable": "protections",
        "refColumn": "id"
      },
      {
        "column": "reviewed_by",
        "refTable": "users",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "protection_requests",
    "columnCount": 17,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "customer_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "customer_number_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "package_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "payment_method_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "status",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": "'pending'::request_status_enum"
      },
      {
        "name": "requested_price",
        "type": "numeric",
        "nullable": false,
        "default": null
      },
      {
        "name": "requested_currency",
        "type": "text",
        "nullable": false,
        "default": "'YER'::text"
      },
      {
        "name": "requested_duration_days",
        "type": "integer",
        "nullable": false,
        "default": null
      },
      {
        "name": "payment_transfer_reference",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "customer_note",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "rejection_reason",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "reviewed_by",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "reviewed_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "pr_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "pr_select_own",
        "command": "SELECT",
        "using": "(customer_id = auth.uid())",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      },
      {
        "column": "customer_id",
        "refTable": "users",
        "refColumn": "id"
      },
      {
        "column": "customer_number_id",
        "refTable": "customer_numbers",
        "refColumn": "id"
      },
      {
        "column": "package_id",
        "refTable": "company_packages",
        "refColumn": "id"
      },
      {
        "column": "payment_method_id",
        "refTable": "payment_methods",
        "refColumn": "id"
      },
      {
        "column": "reviewed_by",
        "refTable": "users",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "protection_tasks",
    "columnCount": 18,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "protection_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "customer_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "customer_number_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "task_number",
        "type": "integer",
        "nullable": false,
        "default": null
      },
      {
        "name": "task_type",
        "type": "text",
        "nullable": false,
        "default": "'operational'::text"
      },
      {
        "name": "amount",
        "type": "numeric",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "currency",
        "type": "text",
        "nullable": false,
        "default": "'YER'::text"
      },
      {
        "name": "scheduled_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": null
      },
      {
        "name": "due_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": null
      },
      {
        "name": "status",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": "'scheduled'::task_status_enum"
      },
      {
        "name": "completed_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "completed_by",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "execution_note",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "source_task_interval_days",
        "type": "integer",
        "nullable": false,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "pt_insert_admin",
        "command": "INSERT",
        "using": null,
        "check": "is_admin()"
      },
      {
        "name": "pt_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "pt_update_admin",
        "command": "UPDATE",
        "using": "is_admin()",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      },
      {
        "column": "completed_by",
        "refTable": "users",
        "refColumn": "id"
      },
      {
        "column": "customer_id",
        "refTable": "users",
        "refColumn": "id"
      },
      {
        "column": "customer_number_id",
        "refTable": "customer_numbers",
        "refColumn": "id"
      },
      {
        "column": "protection_id",
        "refTable": "protections",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "protections",
    "columnCount": 20,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "customer_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "customer_number_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "company_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "source_request_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "package_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "package_name_snapshot",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "price_snapshot",
        "type": "numeric",
        "nullable": false,
        "default": null
      },
      {
        "name": "currency_snapshot",
        "type": "text",
        "nullable": false,
        "default": "'YER'::text"
      },
      {
        "name": "duration_days_snapshot",
        "type": "integer",
        "nullable": false,
        "default": null
      },
      {
        "name": "task_amount_snapshot",
        "type": "numeric",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "task_interval_days_snapshot",
        "type": "integer",
        "nullable": false,
        "default": "30"
      },
      {
        "name": "task_currency_snapshot",
        "type": "text",
        "nullable": false,
        "default": "'YER'::text"
      },
      {
        "name": "start_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": null
      },
      {
        "name": "end_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": null
      },
      {
        "name": "status",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": "'active'::protection_status_enum"
      },
      {
        "name": "renewal_count",
        "type": "integer",
        "nullable": false,
        "default": "0"
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "prot_insert_admin_only",
        "command": "INSERT",
        "using": null,
        "check": "is_admin()"
      },
      {
        "name": "prot_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "prot_select_own",
        "command": "SELECT",
        "using": "((customer_id = auth.uid()) AND (is_deleted = false))",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "company_id",
        "refTable": "companies",
        "refColumn": "id"
      },
      {
        "column": "customer_id",
        "refTable": "users",
        "refColumn": "id"
      },
      {
        "column": "customer_number_id",
        "refTable": "customer_numbers",
        "refColumn": "id"
      },
      {
        "column": "package_id",
        "refTable": "company_packages",
        "refColumn": "id"
      },
      {
        "column": "source_request_id",
        "refTable": "protection_requests",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "system_settings",
    "columnCount": 7,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "setting_key",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "setting_value",
        "type": "jsonb",
        "nullable": true,
        "default": null
      },
      {
        "name": "description",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "is_active",
        "type": "boolean",
        "nullable": false,
        "default": "true"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "ss_manage_admin",
        "command": "ALL",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "ss_select_all",
        "command": "SELECT",
        "using": "(is_active = true)",
        "check": null
      }
    ],
    "foreignKeys": []
  },
  {
    "name": "task_reschedule_history",
    "columnCount": 12,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "task_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "protection_id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "old_scheduled_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "new_scheduled_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "old_due_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "new_due_at",
        "type": "timestamp with time zone",
        "nullable": true,
        "default": null
      },
      {
        "name": "old_interval_days",
        "type": "integer",
        "nullable": true,
        "default": null
      },
      {
        "name": "new_interval_days",
        "type": "integer",
        "nullable": true,
        "default": null
      },
      {
        "name": "reason",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "changed_by",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "trh_insert_admin",
        "command": "INSERT",
        "using": null,
        "check": "is_admin()"
      },
      {
        "name": "trh_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "changed_by",
        "refTable": "users",
        "refColumn": "id"
      },
      {
        "column": "protection_id",
        "refTable": "protections",
        "refColumn": "id"
      },
      {
        "column": "task_id",
        "refTable": "protection_tasks",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "transactions",
    "columnCount": 15,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": "gen_random_uuid()"
      },
      {
        "name": "customer_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "protection_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "request_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "renewal_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "task_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "transaction_type",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": null
      },
      {
        "name": "amount",
        "type": "numeric",
        "nullable": false,
        "default": null
      },
      {
        "name": "currency",
        "type": "text",
        "nullable": false,
        "default": "'YER'::text"
      },
      {
        "name": "payment_method_id",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "external_reference",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "description",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_by",
        "type": "uuid",
        "nullable": true,
        "default": null
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "tx_insert_admin",
        "command": "INSERT",
        "using": null,
        "check": "is_admin()"
      },
      {
        "name": "tx_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      }
    ],
    "foreignKeys": [
      {
        "column": "created_by",
        "refTable": "users",
        "refColumn": "id"
      },
      {
        "column": "customer_id",
        "refTable": "users",
        "refColumn": "id"
      },
      {
        "column": "payment_method_id",
        "refTable": "payment_methods",
        "refColumn": "id"
      },
      {
        "column": "protection_id",
        "refTable": "protections",
        "refColumn": "id"
      },
      {
        "column": "renewal_id",
        "refTable": "protection_renewals",
        "refColumn": "id"
      },
      {
        "column": "request_id",
        "refTable": "protection_requests",
        "refColumn": "id"
      },
      {
        "column": "task_id",
        "refTable": "protection_tasks",
        "refColumn": "id"
      }
    ]
  },
  {
    "name": "users",
    "columnCount": 9,
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "email",
        "type": "text",
        "nullable": false,
        "default": null
      },
      {
        "name": "username",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "full_name",
        "type": "text",
        "nullable": true,
        "default": null
      },
      {
        "name": "user_type",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": "'customer'::user_type_enum"
      },
      {
        "name": "status",
        "type": "USER-DEFINED",
        "nullable": false,
        "default": "'active'::user_status_enum"
      },
      {
        "name": "is_deleted",
        "type": "boolean",
        "nullable": false,
        "default": "false"
      },
      {
        "name": "created_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamp with time zone",
        "nullable": false,
        "default": "now()"
      }
    ],
    "policies": [
      {
        "name": "users_select_admin",
        "command": "SELECT",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "users_select_own",
        "command": "SELECT",
        "using": "(id = auth.uid())",
        "check": null
      },
      {
        "name": "users_update_admin",
        "command": "UPDATE",
        "using": "is_admin()",
        "check": null
      },
      {
        "name": "users_update_own",
        "command": "UPDATE",
        "using": "(id = auth.uid())",
        "check": "((id = auth.uid()) AND (user_type = ( SELECT users_1.user_type\n   FROM users users_1\n  WHERE (users_1.id = auth.uid()))))"
      }
    ],
    "foreignKeys": []
  }
];

export const DB_RPCS: RpcDef[] = [
  {
    "name": "detect_company_from_phone",
    "arguments": "p_normalized_phone text",
    "returnType": "TABLE(company_id uuid, prefix text, number_length integer)",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.detect_company_from_phone(p_normalized_phone text)\n RETURNS TABLE(company_id uuid, prefix text, number_length integer)\n LANGUAGE sql\n STABLE SECURITY DEFINER\nAS $function$\n  SELECT cp.company_id, cp.prefix, cp.number_length\n  FROM public.company_prefixes cp\n  JOIN public.companies c ON c.id = cp.company_id\n  WHERE cp.is_active = TRUE AND cp.is_deleted = FALSE\n    AND c.is_active = TRUE AND c.is_deleted = FALSE\n    AND p_normalized_phone LIKE (cp.prefix || '%')\n  ORDER BY LENGTH(cp.prefix) DESC\n  LIMIT 1;\n$function$\n"
  },
  {
    "name": "get_subscription_status",
    "arguments": "p_company_id uuid, p_end_at timestamp with time zone",
    "returnType": "TABLE(status_code text, display_name_ar text)",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.get_subscription_status(p_company_id uuid, p_end_at timestamp with time zone)\n RETURNS TABLE(status_code text, display_name_ar text)\n LANGUAGE sql\n STABLE SECURITY DEFINER\nAS $function$\n  SELECT cssc.status_code, cssc.display_name_ar\n  FROM public.company_subscription_status_configs cssc\n  WHERE cssc.company_id = p_company_id\n    AND cssc.is_active = TRUE AND cssc.is_deleted = FALSE\n    AND (cssc.min_days_remaining IS NULL OR EXTRACT(EPOCH FROM (p_end_at - NOW())) / 86400 >= cssc.min_days_remaining)\n    AND (cssc.max_days_remaining IS NULL OR EXTRACT(EPOCH FROM (p_end_at - NOW())) / 86400 <= cssc.max_days_remaining)\n  ORDER BY cssc.display_order ASC LIMIT 1;\n$function$\n"
  },
  {
    "name": "handle_new_auth_user",
    "arguments": "",
    "returnType": "trigger",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.handle_new_auth_user()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\nBEGIN\n  INSERT INTO public.users (id, email, user_type, status)\n  VALUES (NEW.id, NEW.email, 'customer', 'active')\n  ON CONFLICT (id) DO NOTHING;\n  RETURN NEW;\nEND; $function$\n"
  },
  {
    "name": "is_active_customer",
    "arguments": "",
    "returnType": "boolean",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.is_active_customer()\n RETURNS boolean\n LANGUAGE sql\n STABLE SECURITY DEFINER\nAS $function$\n  SELECT EXISTS (\n    SELECT 1 FROM public.users\n    WHERE id = auth.uid() AND user_type = 'customer' AND status = 'active' AND is_deleted = FALSE\n  );\n$function$\n"
  },
  {
    "name": "is_admin",
    "arguments": "",
    "returnType": "boolean",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.is_admin()\n RETURNS boolean\n LANGUAGE sql\n STABLE SECURITY DEFINER\nAS $function$\n  SELECT EXISTS (\n    SELECT 1 FROM public.users\n    WHERE id = auth.uid() AND user_type = 'admin' AND status = 'active' AND is_deleted = FALSE\n  );\n$function$\n"
  },
  {
    "name": "normalize_phone",
    "arguments": "p_raw text",
    "returnType": "text",
    "isSecurityDefiner": false,
    "definition": "CREATE OR REPLACE FUNCTION public.normalize_phone(p_raw text)\n RETURNS text\n LANGUAGE plpgsql\n IMMUTABLE\nAS $function$\nDECLARE v_clean TEXT;\nBEGIN\n  v_clean := REGEXP_REPLACE(p_raw, '[^0-9]', '', 'g');\n  IF v_clean LIKE '00967%' THEN v_clean := SUBSTRING(v_clean FROM 6);\n  ELSIF v_clean LIKE '967%' THEN v_clean := SUBSTRING(v_clean FROM 4);\n  END IF;\n  IF v_clean LIKE '0%' AND LENGTH(v_clean) > 1 THEN v_clean := SUBSTRING(v_clean FROM 2); END IF;\n  RETURN v_clean;\nEND; $function$\n"
  },
  {
    "name": "rpc_add_customer_number",
    "arguments": "p_phone_number text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_add_customer_number(p_phone_number text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\nDECLARE\n  v_user_id       UUID := auth.uid();\n  v_normalized    TEXT;\n  v_company_id    UUID;\n  v_prefix        TEXT;\n  v_number_length INTEGER;\n  v_new_id        UUID;\nBEGIN\n  IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'UNAUTHORIZED'); END IF;\n  IF NOT public.is_active_customer() THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'FORBIDDEN'); END IF;\n  v_normalized := public.normalize_phone(p_phone_number);\n  IF LENGTH(v_normalized) < 6 THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'INVALID_PHONE'); END IF;\n  SELECT dc.company_id, dc.prefix, dc.number_length INTO v_company_id, v_prefix, v_number_length\n  FROM public.detect_company_from_phone(v_normalized) dc;\n  IF v_company_id IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'COMPANY_NOT_FOUND'); END IF;\n  IF v_number_length IS NOT NULL AND LENGTH(v_normalized) <> v_number_length THEN\n    RETURN jsonb_build_object('success', FALSE, 'error_code', 'INVALID_PHONE_LENGTH');\n  END IF;\n  IF EXISTS (SELECT 1 FROM public.customer_numbers WHERE customer_id = v_user_id AND normalized_phone_number = v_normalized AND is_deleted = FALSE) THEN\n    RETURN jsonb_build_object('success', FALSE, 'error_code', 'DUPLICATE_OPERATION');\n  END IF;\n  INSERT INTO public.customer_numbers (customer_id, phone_number, normalized_phone_number, company_id, detected_prefix, status)\n  VALUES (v_user_id, p_phone_number, v_normalized, v_company_id, v_prefix, 'active') RETURNING id INTO v_new_id;\n  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)\n  VALUES (v_user_id, 'ADD_NUMBER', 'customer_number', v_new_id::TEXT, jsonb_build_object('phone', v_normalized, 'company_id', v_company_id));\n  RETURN jsonb_build_object('success', TRUE, 'id', v_new_id);\nEND; $function$\n"
  },
  {
    "name": "rpc_approve_protection_request",
    "arguments": "p_request_id uuid",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_approve_protection_request(p_request_id uuid)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nDECLARE\n  v_admin_id uuid := auth.uid();\n  v_req public.protection_requests%ROWTYPE;\n  v_cn public.customer_numbers%ROWTYPE;\n  v_pkg public.company_packages%ROWTYPE;\n  v_ts public.company_task_settings%ROWTYPE;\n  v_payment public.manual_payment_logs%ROWTYPE;\n  v_now timestamptz := now();\n  v_start timestamptz;\n  v_end timestamptz;\n  v_prot_id uuid;\n  v_task_date timestamptz;\n  v_due_date timestamptz;\n  v_task_num integer := 1;\n  v_boundary timestamptz;\nBEGIN\n  IF v_admin_id IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');\n  END IF;\n  IF NOT public.is_admin() THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');\n  END IF;\n\n  SELECT * INTO v_req\n    FROM public.protection_requests\n   WHERE id = p_request_id\n   FOR UPDATE;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');\n  END IF;\n  IF v_req.status <> 'pending' THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_STATE');\n  END IF;\n\n  SELECT * INTO v_cn\n    FROM public.customer_numbers\n   WHERE id = v_req.customer_number_id\n   FOR UPDATE;\n  IF NOT FOUND OR v_cn.customer_id IS DISTINCT FROM v_req.customer_id THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_NUMBER');\n  END IF;\n\n  SELECT * INTO v_pkg\n    FROM public.company_packages\n   WHERE id = v_req.package_id;\n  IF NOT FOUND OR v_pkg.company_id IS DISTINCT FROM v_cn.company_id\n     OR v_req.company_id IS DISTINCT FROM v_cn.company_id THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'COMPANY_MISMATCH');\n  END IF;\n\n  SELECT * INTO v_payment\n    FROM public.manual_payment_logs\n   WHERE request_id = p_request_id\n     AND verification_status = 'verified'\n   ORDER BY verified_at DESC NULLS LAST, created_at DESC\n   LIMIT 1\n   FOR UPDATE;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'PAYMENT_NOT_VERIFIED');\n  END IF;\n\n  /* Locks the number row so concurrent approvals serialize. */\n  IF EXISTS (\n    SELECT 1 FROM public.protections\n     WHERE customer_number_id = v_req.customer_number_id\n       AND status = 'active'\n       AND is_deleted = false\n     FOR UPDATE\n  ) THEN\n    UPDATE public.protection_requests\n       SET status = 'rejected',\n           rejection_reason = 'تمت حماية الرقم بطلب آخر',\n           reviewed_by = v_admin_id,\n           reviewed_at = v_now\n     WHERE id = p_request_id;\n    RETURN jsonb_build_object('success', false, 'error_code', 'ACTIVE_PROTECTION_EXISTS');\n  END IF;\n\n  SELECT * INTO v_ts\n    FROM public.company_task_settings\n   WHERE company_id = v_req.company_id\n     AND is_active = true;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'CONFIGURATION_ERROR');\n  END IF;\n\n  v_start := v_now;\n  v_end := v_start + (v_req.requested_duration_days || ' days')::interval;\n\n  UPDATE public.protection_requests\n     SET status = 'approved', reviewed_by = v_admin_id, reviewed_at = v_now\n   WHERE id = p_request_id AND status = 'pending';\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_STATE');\n  END IF;\n\n  INSERT INTO public.protections (\n    customer_id, customer_number_id, company_id, source_request_id, package_id,\n    package_name_snapshot, price_snapshot, currency_snapshot, duration_days_snapshot,\n    task_amount_snapshot, task_interval_days_snapshot, task_currency_snapshot,\n    start_at, end_at, status, renewal_count\n  ) VALUES (\n    v_req.customer_id, v_req.customer_number_id, v_req.company_id, p_request_id, v_req.package_id,\n    v_pkg.name_ar, v_req.requested_price, v_req.requested_currency, v_req.requested_duration_days,\n    v_ts.task_amount, v_ts.task_interval_days, v_ts.task_currency,\n    v_start, v_end, 'active', 0\n  ) RETURNING id INTO v_prot_id;\n\n  IF v_ts.enable_first_task THEN\n    IF v_ts.allow_after_expiry THEN\n      v_boundary := v_end + (v_ts.max_days_after_expiry || ' days')::interval;\n    ELSE\n      v_boundary := v_end;\n    END IF;\n    v_task_date := v_start;\n    v_due_date := v_task_date + (v_ts.task_interval_days || ' days')::interval;\n    WHILE v_task_date <= v_boundary LOOP\n      INSERT INTO public.protection_tasks (\n        protection_id, customer_id, customer_number_id, company_id,\n        task_number, task_type, amount, currency, scheduled_at, due_at,\n        status, source_task_interval_days\n      ) VALUES (\n        v_prot_id, v_req.customer_id, v_req.customer_number_id, v_req.company_id,\n        v_task_num, 'operational', v_ts.task_amount, v_ts.task_currency,\n        v_task_date, v_due_date, 'scheduled', v_ts.task_interval_days\n      );\n      v_task_num := v_task_num + 1;\n      v_task_date := v_task_date + (v_ts.task_interval_days || ' days')::interval;\n      v_due_date := v_task_date + (v_ts.task_interval_days || ' days')::interval;\n      IF NOT v_ts.enable_recurring_tasks THEN EXIT; END IF;\n    END LOOP;\n  END IF;\n\n  INSERT INTO public.transactions (\n    customer_id, protection_id, request_id, transaction_type, amount, currency,\n    payment_method_id, external_reference, created_by\n  ) VALUES (\n    v_req.customer_id, v_prot_id, p_request_id, 'income', v_req.requested_price,\n    v_req.requested_currency, v_req.payment_method_id,\n    v_req.payment_transfer_reference, v_admin_id\n  );\n\n  /* All other pending requests for the same number lose the race automatically. */\n  UPDATE public.protection_requests\n     SET status = 'rejected',\n         rejection_reason = 'تمت حماية الرقم بطلب آخر',\n         reviewed_by = v_admin_id,\n         reviewed_at = v_now\n   WHERE customer_number_id = v_req.customer_number_id\n     AND id <> p_request_id\n     AND status = 'pending';\n\n  INSERT INTO public.client_notifications\n    (user_id, notification_type, title, body, related_request_id, related_protection_id)\n  VALUES\n    (v_req.customer_id, 'request_approved', 'تم قبول طلبك',\n     'تم قبول طلب الحماية وبدأت حمايتك.', p_request_id, v_prot_id);\n\n  INSERT INTO public.audit_logs\n    (actor_user_id, action, entity_type, entity_id, new_data)\n  VALUES\n    (v_admin_id, 'APPROVE_REQUEST', 'protection_request', p_request_id::text,\n     jsonb_build_object('protection_id', v_prot_id, 'manual_payment_verified', true,\n                        'start_at', v_start, 'end_at', v_end));\n\n  RETURN jsonb_build_object('success', true, 'protection_id', v_prot_id);\nEND;\n$function$\n"
  },
  {
    "name": "rpc_approve_renewal",
    "arguments": "p_renewal_id uuid",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_approve_renewal(p_renewal_id uuid)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nDECLARE\n  v_admin_id uuid := auth.uid();\n  v_renewal public.protection_renewals%ROWTYPE;\n  v_prot public.protections%ROWTYPE;\n  v_ts public.company_task_settings%ROWTYPE;\n  v_payment public.manual_payment_logs%ROWTYPE;\n  v_now timestamptz := now();\n  v_new_end timestamptz;\n  v_candidate timestamptz;\n  v_max_task_num integer;\n  v_boundary timestamptz;\nBEGIN\n  IF v_admin_id IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');\n  END IF;\n  IF NOT public.is_admin() THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');\n  END IF;\n\n  SELECT * INTO v_renewal\n    FROM public.protection_renewals\n   WHERE id = p_renewal_id\n   FOR UPDATE;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');\n  END IF;\n  IF v_renewal.status <> 'pending' THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'RENEWAL_ALREADY_PROCESSED');\n  END IF;\n\n  SELECT * INTO v_prot\n    FROM public.protections\n   WHERE id = v_renewal.protection_id\n   FOR UPDATE;\n  IF NOT FOUND OR v_prot.customer_id IS DISTINCT FROM v_renewal.customer_id\n     OR v_prot.status <> 'active' OR v_prot.is_deleted THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_PROTECTION');\n  END IF;\n\n  SELECT * INTO v_payment\n    FROM public.manual_payment_logs\n   WHERE renewal_id = p_renewal_id\n     AND verification_status = 'verified'\n   ORDER BY verified_at DESC NULLS LAST, created_at DESC\n   LIMIT 1\n   FOR UPDATE;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'PAYMENT_NOT_VERIFIED');\n  END IF;\n\n  SELECT * INTO v_ts\n    FROM public.company_task_settings\n   WHERE company_id = v_prot.company_id\n     AND is_active = true;\n\n  v_new_end := v_prot.end_at + (v_renewal.duration_days_snapshot || ' days')::interval;\n\n  UPDATE public.protection_renewals\n     SET status = 'approved', new_end_at = v_new_end,\n         reviewed_by = v_admin_id, reviewed_at = v_now\n   WHERE id = p_renewal_id AND status = 'pending';\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'RENEWAL_ALREADY_PROCESSED');\n  END IF;\n\n  UPDATE public.protections\n     SET end_at = v_new_end,\n         renewal_count = renewal_count + 1,\n         updated_at = v_now\n   WHERE id = v_renewal.protection_id;\n\n  IF v_ts IS NOT NULL THEN\n    SELECT COALESCE(MAX(scheduled_at), v_prot.start_at)\n      INTO v_candidate\n      FROM public.protection_tasks\n     WHERE protection_id = v_prot.id;\n    SELECT COALESCE(MAX(task_number), 0)\n      INTO v_max_task_num\n      FROM public.protection_tasks\n     WHERE protection_id = v_prot.id;\n\n    IF v_ts.allow_after_expiry THEN\n      v_boundary := v_new_end + (v_ts.max_days_after_expiry || ' days')::interval;\n    ELSE\n      v_boundary := v_new_end;\n    END IF;\n\n    v_candidate := v_candidate + (v_ts.task_interval_days || ' days')::interval;\n    WHILE v_candidate <= v_boundary LOOP\n      IF NOT EXISTS (\n        SELECT 1 FROM public.protection_tasks\n         WHERE protection_id = v_prot.id\n           AND scheduled_at = v_candidate\n      ) THEN\n        v_max_task_num := v_max_task_num + 1;\n        INSERT INTO public.protection_tasks (\n          protection_id, customer_id, customer_number_id, company_id,\n          task_number, task_type, amount, currency, scheduled_at, due_at,\n          status, source_task_interval_days\n        ) VALUES (\n          v_prot.id, v_prot.customer_id, v_prot.customer_number_id, v_prot.company_id,\n          v_max_task_num, 'operational', v_ts.task_amount, v_ts.task_currency,\n          v_candidate,\n          v_candidate + (v_ts.task_interval_days || ' days')::interval,\n          'scheduled', v_ts.task_interval_days\n        );\n      END IF;\n      v_candidate := v_candidate + (v_ts.task_interval_days || ' days')::interval;\n    END LOOP;\n  END IF;\n\n  INSERT INTO public.transactions (\n    customer_id, protection_id, renewal_id, transaction_type, amount,\n    currency, payment_method_id, external_reference, created_by\n  ) VALUES (\n    v_renewal.customer_id, v_renewal.protection_id, p_renewal_id, 'income',\n    v_renewal.price_snapshot, v_renewal.currency_snapshot,\n    v_renewal.payment_method_id, v_renewal.payment_transfer_reference, v_admin_id\n  );\n\n  INSERT INTO public.client_notifications\n    (user_id, notification_type, title, body, related_protection_id)\n  VALUES (\n    v_renewal.customer_id, 'renewal_approved', 'تم قبول تجديد الحماية',\n    'تم تمديد حمايتك حتى ' || v_new_end::date::text, v_renewal.protection_id\n  );\n\n  INSERT INTO public.audit_logs\n    (actor_user_id, action, entity_type, entity_id, new_data)\n  VALUES (\n    v_admin_id, 'APPROVE_RENEWAL', 'protection_renewal', p_renewal_id::text,\n    jsonb_build_object('new_end_at', v_new_end, 'previous_end_at', v_prot.end_at,\n                       'manual_payment_verified', true)\n  );\n\n  RETURN jsonb_build_object('success', true, 'new_end_at', v_new_end);\nEND;\n$function$\n"
  },
  {
    "name": "rpc_create_protection_request",
    "arguments": "p_customer_number_id uuid, p_package_id uuid, p_payment_method_id uuid, p_transfer_reference text, p_customer_note text DEFAULT NULL::text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_create_protection_request(p_customer_number_id uuid, p_package_id uuid, p_payment_method_id uuid, p_transfer_reference text, p_customer_note text DEFAULT NULL::text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nDECLARE\n  v_user_id uuid := auth.uid();\n  v_cn public.customer_numbers%ROWTYPE;\n  v_package public.company_packages%ROWTYPE;\n  v_pm public.payment_methods%ROWTYPE;\n  v_number_length integer;\n  v_new_id uuid;\nBEGIN\n  IF v_user_id IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');\n  END IF;\n  IF NOT public.is_active_customer() THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');\n  END IF;\n  IF p_transfer_reference IS NULL OR length(trim(p_transfer_reference)) = 0 THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'VALIDATION_ERROR', 'field', 'transfer_reference');\n  END IF;\n\n  SELECT * INTO v_cn\n    FROM public.customer_numbers\n   WHERE id = p_customer_number_id\n     AND customer_id = v_user_id\n     AND is_deleted = false\n     AND status = 'active'\n   FOR UPDATE;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND', 'entity', 'customer_number');\n  END IF;\n\n  /* Re-detect company from the phone itself; do not trust a mutable company_id. */\n  SELECT dc.company_id, dc.prefix, dc.number_length\n    INTO v_cn.company_id, v_cn.detected_prefix, v_number_length\n    FROM public.detect_company_from_phone(v_cn.normalized_phone_number) dc;\n\n  IF v_cn.company_id IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'COMPANY_NOT_FOUND');\n  END IF;\n\n  IF v_number_length IS NOT NULL AND length(v_cn.normalized_phone_number) <> v_number_length THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_PHONE_LENGTH');\n  END IF;\n\n  IF v_cn.company_id IS DISTINCT FROM (\n    SELECT company_id FROM public.customer_numbers WHERE id = p_customer_number_id\n  ) THEN\n    UPDATE public.customer_numbers\n       SET company_id = v_cn.company_id,\n           detected_prefix = v_cn.detected_prefix,\n           updated_at = now()\n     WHERE id = p_customer_number_id;\n  ELSE\n    UPDATE public.customer_numbers\n       SET detected_prefix = v_cn.detected_prefix,\n           updated_at = now()\n     WHERE id = p_customer_number_id;\n  END IF;\n\n  SELECT * INTO v_package\n    FROM public.company_packages\n   WHERE id = p_package_id\n     AND company_id = v_cn.company_id\n     AND is_active = true\n     AND is_visible = true\n     AND is_deleted = false;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'PACKAGE_UNAVAILABLE');\n  END IF;\n\n  SELECT * INTO v_pm\n    FROM public.payment_methods\n   WHERE id = p_payment_method_id\n     AND is_active = true\n     AND is_deleted = false;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'PAYMENT_METHOD_UNAVAILABLE');\n  END IF;\n\n  IF EXISTS (\n    SELECT 1 FROM public.protections\n     WHERE customer_number_id = p_customer_number_id\n       AND status = 'active'\n       AND is_deleted = false\n  ) THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'ACTIVE_PROTECTION_EXISTS');\n  END IF;\n\n  INSERT INTO public.protection_requests (\n    customer_id, customer_number_id, company_id, package_id, payment_method_id,\n    status, requested_price, requested_currency, requested_duration_days,\n    payment_transfer_reference, customer_note\n  ) VALUES (\n    v_user_id, p_customer_number_id, v_cn.company_id, p_package_id, p_payment_method_id,\n    'pending', v_package.price, v_package.currency, v_package.duration_days,\n    trim(p_transfer_reference), p_customer_note\n  ) RETURNING id INTO v_new_id;\n\n  /* Internal record of an external/manual payment verification workflow. */\n  INSERT INTO public.manual_payment_logs (\n    request_id, payment_method_id, transfer_reference, amount, verification_status\n  ) VALUES (\n    v_new_id, p_payment_method_id, trim(p_transfer_reference), v_package.price, 'pending'\n  );\n\n  INSERT INTO public.admin_notifications (notification_type, title, body, related_request_id)\n  VALUES ('new_request', 'طلب حماية جديد', 'تم إرسال طلب حماية جديد بانتظار المراجعة', v_new_id);\n\n  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id)\n  VALUES (v_user_id, 'CREATE_PROTECTION_REQUEST', 'protection_request', v_new_id::text);\n\n  RETURN jsonb_build_object('success', true, 'id', v_new_id, 'company_id', v_cn.company_id);\nEND;\n$function$\n"
  },
  {
    "name": "rpc_create_renewal_request",
    "arguments": "p_protection_id uuid, p_package_id uuid, p_payment_method_id uuid, p_transfer_reference text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_create_renewal_request(p_protection_id uuid, p_package_id uuid, p_payment_method_id uuid, p_transfer_reference text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nDECLARE\n  v_user_id uuid := auth.uid();\n  v_prot public.protections%ROWTYPE;\n  v_pkg public.company_packages%ROWTYPE;\n  v_pm public.payment_methods%ROWTYPE;\n  v_ss public.company_subscription_settings%ROWTYPE;\n  v_new_id uuid;\nBEGIN\n  IF v_user_id IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');\n  END IF;\n  IF NOT public.is_active_customer() THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');\n  END IF;\n  IF p_transfer_reference IS NULL OR length(trim(p_transfer_reference)) = 0 THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'VALIDATION_ERROR');\n  END IF;\n\n  SELECT * INTO v_prot\n    FROM public.protections\n   WHERE id = p_protection_id\n     AND customer_id = v_user_id\n     AND is_deleted = false\n     AND status = 'active'\n   FOR UPDATE;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');\n  END IF;\n\n  SELECT * INTO v_ss\n    FROM public.company_subscription_settings\n   WHERE company_id = v_prot.company_id;\n  IF v_ss IS NOT NULL AND NOT v_ss.renewal_enabled THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'RENEWAL_NOT_ALLOWED');\n  END IF;\n\n  SELECT * INTO v_pkg\n    FROM public.company_packages\n   WHERE id = p_package_id\n     AND company_id = v_prot.company_id\n     AND is_active = true\n     AND is_visible = true\n     AND is_deleted = false;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'PACKAGE_UNAVAILABLE');\n  END IF;\n\n  SELECT * INTO v_pm\n    FROM public.payment_methods\n   WHERE id = p_payment_method_id\n     AND is_active = true\n     AND is_deleted = false;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'PAYMENT_METHOD_UNAVAILABLE');\n  END IF;\n\n  INSERT INTO public.protection_renewals (\n    protection_id, customer_id, package_id, price_snapshot, currency_snapshot,\n    duration_days_snapshot, previous_end_at, payment_method_id,\n    payment_transfer_reference, status\n  ) VALUES (\n    p_protection_id, v_user_id, p_package_id, v_pkg.price, v_pkg.currency,\n    v_pkg.duration_days, v_prot.end_at, p_payment_method_id,\n    trim(p_transfer_reference), 'pending'\n  ) RETURNING id INTO v_new_id;\n\n  INSERT INTO public.manual_payment_logs (\n    renewal_id, payment_method_id, transfer_reference, amount, verification_status\n  ) VALUES (\n    v_new_id, p_payment_method_id, trim(p_transfer_reference), v_pkg.price, 'pending'\n  );\n\n  INSERT INTO public.admin_notifications\n    (notification_type, title, body, related_protection_id)\n  VALUES\n    ('new_renewal', 'طلب تجديد جديد', 'تم إرسال طلب تجديد بانتظار المراجعة', p_protection_id);\n\n  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id)\n  VALUES (v_user_id, 'CREATE_RENEWAL', 'protection_renewal', v_new_id::text);\n\n  RETURN jsonb_build_object('success', true, 'id', v_new_id);\nEND;\n$function$\n"
  },
  {
    "name": "rpc_execute_task",
    "arguments": "p_task_id uuid, p_execution_note text DEFAULT NULL::text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_execute_task(p_task_id uuid, p_execution_note text DEFAULT NULL::text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nDECLARE\n  v_admin_id uuid := auth.uid();\n  v_task public.protection_tasks%ROWTYPE;\n  v_prot public.protections%ROWTYPE;\n  v_ts public.company_task_settings%ROWTYPE;\n  v_now timestamptz := now();\n  v_next_date timestamptz;\n  v_next_due timestamptz;\n  v_next_num integer;\n  v_new_task_id uuid;\n  v_boundary timestamptz;\nBEGIN\n  IF v_admin_id IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');\n  END IF;\n  IF NOT public.is_admin() THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');\n  END IF;\n\n  SELECT * INTO v_task\n    FROM public.protection_tasks\n   WHERE id = p_task_id\n   FOR UPDATE;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');\n  END IF;\n  IF v_task.status = 'completed' THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'TASK_ALREADY_COMPLETED');\n  END IF;\n\n  SELECT * INTO v_prot\n    FROM public.protections\n   WHERE id = v_task.protection_id\n   FOR UPDATE;\n  SELECT * INTO v_ts\n    FROM public.company_task_settings\n   WHERE company_id = v_task.company_id\n     AND is_active = true;\n\n  UPDATE public.protection_tasks\n     SET status = 'completed', completed_at = v_now,\n         completed_by = v_admin_id, execution_note = p_execution_note,\n         updated_at = v_now\n   WHERE id = p_task_id AND status <> 'completed';\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'TASK_ALREADY_COMPLETED');\n  END IF;\n\n  IF v_task.amount > 0 THEN\n    INSERT INTO public.transactions\n      (customer_id, protection_id, task_id, transaction_type, amount, currency, created_by)\n    VALUES\n      (v_task.customer_id, v_task.protection_id, p_task_id, 'expense',\n       v_task.amount, v_task.currency, v_admin_id);\n  END IF;\n\n  IF v_ts IS NOT NULL AND v_ts.enable_recurring_tasks THEN\n    v_next_date := v_task.scheduled_at + (v_ts.task_interval_days || ' days')::interval;\n    v_next_due := v_next_date + (v_ts.task_interval_days || ' days')::interval;\n    v_next_num := v_task.task_number + 1;\n\n    IF v_ts.allow_after_expiry THEN\n      v_boundary := v_prot.end_at + (v_ts.max_days_after_expiry || ' days')::interval;\n    ELSE\n      v_boundary := v_prot.end_at;\n    END IF;\n\n    IF v_next_date <= v_boundary\n       AND NOT EXISTS (\n         SELECT 1 FROM public.protection_tasks\n          WHERE protection_id = v_task.protection_id\n            AND task_number = v_next_num\n       ) THEN\n      INSERT INTO public.protection_tasks (\n        protection_id, customer_id, customer_number_id, company_id,\n        task_number, task_type, amount, currency, scheduled_at, due_at,\n        status, source_task_interval_days\n      ) VALUES (\n        v_task.protection_id, v_task.customer_id, v_task.customer_number_id, v_task.company_id,\n        v_next_num, 'operational', v_ts.task_amount, v_ts.task_currency,\n        v_next_date, v_next_due, 'scheduled', v_ts.task_interval_days\n      ) RETURNING id INTO v_new_task_id;\n    END IF;\n  END IF;\n\n  INSERT INTO public.audit_logs\n    (actor_user_id, action, entity_type, entity_id, new_data)\n  VALUES (\n    v_admin_id, 'EXECUTE_TASK', 'protection_task', p_task_id::text,\n    jsonb_build_object('completed_at', v_now, 'next_task_id', v_new_task_id)\n  );\n\n  RETURN jsonb_build_object('success', true, 'next_task_id', v_new_task_id);\nEND;\n$function$\n"
  },
  {
    "name": "rpc_mark_admin_notification_read",
    "arguments": "p_notification_id uuid",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_mark_admin_notification_read(p_notification_id uuid)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\nDECLARE v_admin_id UUID := auth.uid();\nBEGIN\n  IF NOT public.is_admin() THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'FORBIDDEN'); END IF;\n  UPDATE public.admin_notifications SET is_read = TRUE, read_at = NOW() WHERE id = p_notification_id AND is_read = FALSE;\n  RETURN jsonb_build_object('success', TRUE);\nEND; $function$\n"
  },
  {
    "name": "rpc_mark_notification_read",
    "arguments": "p_notification_id uuid",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_mark_notification_read(p_notification_id uuid)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\nDECLARE v_user_id UUID := auth.uid();\nBEGIN\n  IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'UNAUTHORIZED'); END IF;\n  UPDATE public.client_notifications SET is_read = TRUE, read_at = NOW() WHERE id = p_notification_id AND user_id = v_user_id AND is_read = FALSE;\n  RETURN jsonb_build_object('success', TRUE);\nEND; $function$\n"
  },
  {
    "name": "rpc_reject_protection_request",
    "arguments": "p_request_id uuid, p_rejection_reason text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_reject_protection_request(p_request_id uuid, p_rejection_reason text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\nDECLARE\n  v_admin_id UUID := auth.uid();\n  v_req      public.protection_requests%ROWTYPE;\nBEGIN\n  IF v_admin_id IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'UNAUTHORIZED'); END IF;\n  IF NOT public.is_admin() THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'FORBIDDEN'); END IF;\n  IF p_rejection_reason IS NULL OR LENGTH(TRIM(p_rejection_reason)) = 0 THEN\n    RETURN jsonb_build_object('success', FALSE, 'error_code', 'VALIDATION_ERROR');\n  END IF;\n  SELECT * INTO v_req FROM public.protection_requests WHERE id = p_request_id;\n  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'NOT_FOUND'); END IF;\n  IF v_req.status <> 'pending' THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'INVALID_STATE'); END IF;\n  UPDATE public.protection_requests SET status = 'rejected', rejection_reason = p_rejection_reason, reviewed_by = v_admin_id, reviewed_at = NOW() WHERE id = p_request_id;\n  INSERT INTO public.client_notifications (user_id, notification_type, title, body, related_request_id)\n  VALUES (v_req.customer_id, 'request_rejected', 'تم رفض طلبك', 'تم رفض طلب الحماية. السبب: ' || p_rejection_reason, p_request_id);\n  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)\n  VALUES (v_admin_id, 'REJECT_REQUEST', 'protection_request', p_request_id::TEXT, jsonb_build_object('reason', p_rejection_reason));\n  RETURN jsonb_build_object('success', TRUE);\nEND; $function$\n"
  },
  {
    "name": "rpc_reject_renewal",
    "arguments": "p_renewal_id uuid, p_rejection_reason text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_reject_renewal(p_renewal_id uuid, p_rejection_reason text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\nDECLARE\n  v_admin_id UUID := auth.uid();\n  v_renewal  public.protection_renewals%ROWTYPE;\nBEGIN\n  IF v_admin_id IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'UNAUTHORIZED'); END IF;\n  IF NOT public.is_admin() THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'FORBIDDEN'); END IF;\n  IF p_rejection_reason IS NULL OR LENGTH(TRIM(p_rejection_reason)) = 0 THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'VALIDATION_ERROR'); END IF;\n  SELECT * INTO v_renewal FROM public.protection_renewals WHERE id = p_renewal_id;\n  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'NOT_FOUND'); END IF;\n  IF v_renewal.status <> 'pending' THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'RENEWAL_ALREADY_PROCESSED'); END IF;\n  UPDATE public.protection_renewals SET status = 'rejected', rejection_reason = p_rejection_reason, reviewed_by = v_admin_id, reviewed_at = NOW() WHERE id = p_renewal_id;\n  INSERT INTO public.client_notifications (user_id, notification_type, title, body, related_protection_id)\n  VALUES (v_renewal.customer_id, 'renewal_rejected', 'تم رفض طلب التجديد', 'السبب: ' || p_rejection_reason, v_renewal.protection_id);\n  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)\n  VALUES (v_admin_id, 'REJECT_RENEWAL', 'protection_renewal', p_renewal_id::TEXT, jsonb_build_object('reason', p_rejection_reason));\n  RETURN jsonb_build_object('success', TRUE);\nEND; $function$\n"
  },
  {
    "name": "rpc_reschedule_task",
    "arguments": "p_task_id uuid, p_new_scheduled_at timestamp with time zone, p_reason text DEFAULT NULL::text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_reschedule_task(p_task_id uuid, p_new_scheduled_at timestamp with time zone, p_reason text DEFAULT NULL::text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nDECLARE\n  v_admin_id uuid := auth.uid();\n  v_task public.protection_tasks%ROWTYPE;\n  v_future public.protection_tasks%ROWTYPE;\n  v_ts public.company_task_settings%ROWTYPE;\n  v_interval integer;\n  v_new_date timestamptz;\n  v_new_due timestamptz;\nBEGIN\n  IF v_admin_id IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');\n  END IF;\n  IF NOT public.is_admin() THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');\n  END IF;\n  IF p_new_scheduled_at IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'VALIDATION_ERROR');\n  END IF;\n\n  SELECT * INTO v_task\n    FROM public.protection_tasks\n   WHERE id = p_task_id\n   FOR UPDATE;\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');\n  END IF;\n  IF v_task.status = 'completed' THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_STATE');\n  END IF;\n\n  SELECT * INTO v_ts\n    FROM public.company_task_settings\n   WHERE company_id = v_task.company_id\n     AND is_active = true;\n  IF v_ts IS NOT NULL AND NOT v_ts.allow_reschedule THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'RESCHEDULE_NOT_ALLOWED');\n  END IF;\n\n  v_interval := COALESCE(v_ts.task_interval_days, v_task.source_task_interval_days);\n  IF v_interval IS NULL OR v_interval <= 0 THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'CONFIGURATION_ERROR');\n  END IF;\n\n  v_new_date := p_new_scheduled_at;\n  v_new_due := v_new_date + (v_interval || ' days')::interval;\n\n  INSERT INTO public.task_reschedule_history (\n    task_id, protection_id, old_scheduled_at, new_scheduled_at,\n    old_due_at, new_due_at, old_interval_days, new_interval_days,\n    reason, changed_by\n  ) VALUES (\n    p_task_id, v_task.protection_id, v_task.scheduled_at, v_new_date,\n    v_task.due_at, v_new_due, v_task.source_task_interval_days,\n    v_interval, p_reason, v_admin_id\n  );\n\n  UPDATE public.protection_tasks\n     SET scheduled_at = v_new_date,\n         due_at = v_new_due,\n         source_task_interval_days = v_interval,\n         updated_at = now()\n   WHERE id = p_task_id;\n\n  /* Rebuild only future, uncompleted tasks from the rescheduled task baseline. */\n  FOR v_future IN\n    SELECT *\n      FROM public.protection_tasks\n     WHERE protection_id = v_task.protection_id\n       AND id <> p_task_id\n       AND status <> 'completed'\n       AND task_number > v_task.task_number\n     ORDER BY task_number\n     FOR UPDATE\n  LOOP\n    v_new_date := v_new_date + (v_interval || ' days')::interval;\n    v_new_due := v_new_date + (v_interval || ' days')::interval;\n\n    INSERT INTO public.task_reschedule_history (\n      task_id, protection_id, old_scheduled_at, new_scheduled_at,\n      old_due_at, new_due_at, old_interval_days, new_interval_days,\n      reason, changed_by\n    ) VALUES (\n      v_future.id, v_future.protection_id, v_future.scheduled_at, v_new_date,\n      v_future.due_at, v_new_due, v_future.source_task_interval_days,\n      v_interval, COALESCE(p_reason, 'baseline_reschedule'), v_admin_id\n    );\n\n    UPDATE public.protection_tasks\n       SET scheduled_at = v_new_date,\n           due_at = v_new_due,\n           source_task_interval_days = v_interval,\n           updated_at = now()\n     WHERE id = v_future.id;\n  END LOOP;\n\n  INSERT INTO public.audit_logs\n    (actor_user_id, action, entity_type, entity_id, new_data)\n  VALUES (\n    v_admin_id, 'RESCHEDULE_TASK', 'protection_task', p_task_id::text,\n    jsonb_build_object('new_date', p_new_scheduled_at,\n                       'interval_days', v_interval,\n                       'reason', p_reason)\n  );\n\n  RETURN jsonb_build_object('success', true);\nEND;\n$function$\n"
  },
  {
    "name": "rpc_update_customer_number_notes",
    "arguments": "p_customer_number_id uuid, p_notes text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_update_customer_number_notes(p_customer_number_id uuid, p_notes text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nDECLARE\n  v_user_id uuid := auth.uid();\nBEGIN\n  IF v_user_id IS NULL THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');\n  END IF;\n  IF NOT public.is_active_customer() THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');\n  END IF;\n\n  UPDATE public.customer_numbers\n     SET notes = p_notes,\n         updated_at = now()\n   WHERE id = p_customer_number_id\n     AND customer_id = v_user_id\n     AND is_deleted = false;\n\n  IF NOT FOUND THEN\n    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');\n  END IF;\n\n  RETURN jsonb_build_object('success', true);\nEND;\n$function$\n"
  },
  {
    "name": "rpc_update_task_interval",
    "arguments": "p_company_id uuid, p_new_interval integer",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_update_task_interval(p_company_id uuid, p_new_interval integer)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\nDECLARE\n  v_admin_id       UUID := auth.uid();\n  v_old_interval   INTEGER;\n  v_task           RECORD;\n  v_prot           public.protections%ROWTYPE;\n  v_ts             public.company_task_settings%ROWTYPE;\n  v_last_completed TIMESTAMPTZ;\n  v_new_date       TIMESTAMPTZ;\n  v_new_due        TIMESTAMPTZ;\n  v_offset         INTEGER;\nBEGIN\n  IF v_admin_id IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'UNAUTHORIZED'); END IF;\n  IF NOT public.is_admin() THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'FORBIDDEN'); END IF;\n  IF p_new_interval IS NULL OR p_new_interval <= 0 THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'VALIDATION_ERROR'); END IF;\n  SELECT * INTO v_ts FROM public.company_task_settings WHERE company_id = p_company_id AND is_active = TRUE;\n  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error_code', 'NOT_FOUND'); END IF;\n  v_old_interval := v_ts.task_interval_days;\n  UPDATE public.company_task_settings SET task_interval_days = p_new_interval WHERE company_id = p_company_id AND is_active = TRUE;\n  FOR v_prot IN SELECT * FROM public.protections WHERE company_id = p_company_id AND status = 'active' AND is_deleted = FALSE LOOP\n    SELECT MAX(scheduled_at) INTO v_last_completed FROM public.protection_tasks WHERE protection_id = v_prot.id AND status = 'completed';\n    IF v_last_completed IS NULL THEN v_last_completed := v_prot.start_at; END IF;\n    v_offset := 1;\n    FOR v_task IN SELECT id, scheduled_at, due_at FROM public.protection_tasks WHERE protection_id = v_prot.id AND status <> 'completed' ORDER BY task_number LOOP\n      v_new_date := v_last_completed + (p_new_interval * v_offset || ' days')::INTERVAL;\n      v_new_due  := v_new_date + (p_new_interval || ' days')::INTERVAL;\n      INSERT INTO public.task_reschedule_history (task_id, protection_id, old_scheduled_at, new_scheduled_at, old_due_at, new_due_at, old_interval_days, new_interval_days, reason, changed_by)\n      VALUES (v_task.id, v_prot.id, v_task.scheduled_at, v_new_date, v_task.due_at, v_new_due, v_old_interval, p_new_interval, 'interval_setting_changed', v_admin_id);\n      UPDATE public.protection_tasks SET scheduled_at = v_new_date, due_at = v_new_due, source_task_interval_days = p_new_interval WHERE id = v_task.id;\n      v_offset := v_offset + 1;\n    END LOOP;\n  END LOOP;\n  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)\n  VALUES (v_admin_id, 'UPDATE_TASK_INTERVAL', 'company_task_settings', v_ts.id::TEXT, jsonb_build_object('old_interval', v_old_interval, 'new_interval', p_new_interval));\n  RETURN jsonb_build_object('success', TRUE);\nEND; $function$\n"
  },
  {
    "name": "rpc_verify_manual_payment",
    "arguments": "p_request_id uuid DEFAULT NULL::uuid, p_renewal_id uuid DEFAULT NULL::uuid, p_verification_status payment_verification_status_enum DEFAULT 'verified'::payment_verification_status_enum, p_verification_note text DEFAULT NULL::text",
    "returnType": "jsonb",
    "isSecurityDefiner": true,
    "definition": "CREATE OR REPLACE FUNCTION public.rpc_verify_manual_payment(p_request_id uuid DEFAULT NULL::uuid, p_renewal_id uuid DEFAULT NULL::uuid, p_verification_status payment_verification_status_enum DEFAULT 'verified'::payment_verification_status_enum, p_verification_note text DEFAULT NULL::text)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\n\nDECLARE\n    v_admin_id uuid := auth.uid();\n\n    v_request public.protection_requests%ROWTYPE;\n    v_renewal public.protection_renewals%ROWTYPE;\n\n    v_log_id uuid;\n\nBEGIN\n\n    -- ----------------------------------------------------------\n    -- Authentication\n    -- ----------------------------------------------------------\n\n    IF v_admin_id IS NULL THEN\n        RETURN jsonb_build_object(\n            'success', false,\n            'error_code', 'UNAUTHORIZED'\n        );\n    END IF;\n\n\n    -- ----------------------------------------------------------\n    -- Admin authorization\n    -- Multiple admin accounts are allowed.\n    -- ----------------------------------------------------------\n\n    IF NOT public.is_admin() THEN\n        RETURN jsonb_build_object(\n            'success', false,\n            'error_code', 'FORBIDDEN'\n        );\n    END IF;\n\n\n    -- ----------------------------------------------------------\n    -- Exactly one target\n    -- ----------------------------------------------------------\n\n    IF (p_request_id IS NULL) = (p_renewal_id IS NULL) THEN\n        RETURN jsonb_build_object(\n            'success', false,\n            'error_code', 'VALIDATION_ERROR',\n            'message', 'Exactly one request_id or renewal_id is required.'\n        );\n    END IF;\n\n\n    -- ----------------------------------------------------------\n    -- Only verified/rejected are final verification actions.\n    -- Pending is created automatically when the payment request\n    -- is submitted.\n    -- ----------------------------------------------------------\n\n    IF p_verification_status NOT IN ('verified', 'rejected') THEN\n        RETURN jsonb_build_object(\n            'success', false,\n            'error_code', 'INVALID_VERIFICATION_STATUS'\n        );\n    END IF;\n\n\n    -- ==========================================================\n    -- PROTECTION REQUEST\n    -- ==========================================================\n\n    IF p_request_id IS NOT NULL THEN\n\n        SELECT *\n        INTO v_request\n        FROM public.protection_requests\n        WHERE id = p_request_id\n        FOR UPDATE;\n\n\n        IF NOT FOUND THEN\n            RETURN jsonb_build_object(\n                'success', false,\n                'error_code', 'NOT_FOUND'\n            );\n        END IF;\n\n\n        -- Payment verification is part of the pending workflow.\n        IF v_request.status <> 'pending' THEN\n            RETURN jsonb_build_object(\n                'success', false,\n                'error_code', 'INVALID_STATE',\n                'message', 'Payment verification is only allowed while the request is pending.'\n            );\n        END IF;\n\n\n        -- Preserve every verification attempt as a separate\n        -- historical record.\n        INSERT INTO public.manual_payment_logs (\n            request_id,\n            payment_method_id,\n            transfer_reference,\n            amount,\n            verification_status,\n            verified_by,\n            verified_at,\n            verification_note,\n            created_at\n        )\n        VALUES (\n            v_request.id,\n            v_request.payment_method_id,\n            v_request.payment_transfer_reference,\n            v_request.requested_price,\n            p_verification_status,\n            v_admin_id,\n            now(),\n            p_verification_note,\n            now()\n        )\n        RETURNING id INTO v_log_id;\n\n\n        INSERT INTO public.audit_logs (\n            actor_user_id,\n            action,\n            entity_type,\n            entity_id,\n            new_data\n        )\n        VALUES (\n            v_admin_id,\n            'VERIFY_MANUAL_PAYMENT',\n            'protection_request',\n            p_request_id::text,\n            jsonb_build_object(\n                'verification_status', p_verification_status,\n                'manual_payment_log_id', v_log_id,\n                'verification_note', p_verification_note,\n                'external_payment_verification', true\n            )\n        );\n\n\n        RETURN jsonb_build_object(\n            'success', true,\n            'verification_status', p_verification_status,\n            'manual_payment_log_id', v_log_id\n        );\n\n    END IF;\n\n\n    -- ==========================================================\n    -- RENEWAL REQUEST\n    -- ==========================================================\n\n    SELECT *\n    INTO v_renewal\n    FROM public.protection_renewals\n    WHERE id = p_renewal_id\n    FOR UPDATE;\n\n\n    IF NOT FOUND THEN\n        RETURN jsonb_build_object(\n            'success', false,\n            'error_code', 'NOT_FOUND'\n        );\n    END IF;\n\n\n    -- Renewal payment verification is also only allowed while\n    -- the renewal is pending.\n    IF v_renewal.status <> 'pending' THEN\n        RETURN jsonb_build_object(\n            'success', false,\n            'error_code', 'INVALID_STATE',\n            'message', 'Payment verification is only allowed while the renewal is pending.'\n        );\n    END IF;\n\n\n    -- Preserve every verification attempt.\n    INSERT INTO public.manual_payment_logs (\n        renewal_id,\n        payment_method_id,\n        transfer_reference,\n        amount,\n        verification_status,\n        verified_by,\n        verified_at,\n        verification_note,\n        created_at\n    )\n    VALUES (\n        v_renewal.id,\n        v_renewal.payment_method_id,\n        v_renewal.payment_transfer_reference,\n        v_renewal.price_snapshot,\n        p_verification_status,\n        v_admin_id,\n        now(),\n        p_verification_note,\n        now()\n    )\n    RETURNING id INTO v_log_id;\n\n\n    INSERT INTO public.audit_logs (\n        actor_user_id,\n        action,\n        entity_type,\n        entity_id,\n        new_data\n    )\n    VALUES (\n        v_admin_id,\n        'VERIFY_MANUAL_PAYMENT',\n        'protection_renewal',\n        p_renewal_id::text,\n        jsonb_build_object(\n            'verification_status', p_verification_status,\n            'manual_payment_log_id', v_log_id,\n            'verification_note', p_verification_note,\n            'external_payment_verification', true\n        )\n    );\n\n\n    RETURN jsonb_build_object(\n        'success', true,\n        'verification_status', p_verification_status,\n        'manual_payment_log_id', v_log_id\n    );\n\nEND;\n$function$\n"
  },
  {
    "name": "set_updated_at",
    "arguments": "",
    "returnType": "trigger",
    "isSecurityDefiner": false,
    "definition": "CREATE OR REPLACE FUNCTION public.set_updated_at()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nBEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$\n"
  }
];
