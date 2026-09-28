/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserType = 'customer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'disabled';

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  user_type: UserType;
  status: UserStatus;
  role_id?: string | null;
  is_deleted: boolean;
  created_at: string;
}

export interface TelecomProvider {
  id: string;
  name_ar: string;
  name_en?: string | null;
  code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
  is_deleted?: boolean;
  prefixes?: string[];
}

export interface TelecomProviderPrefix {
  id: string;
  company_id: string;
  prefix: string;
  number_length: number;
  is_active: boolean;
}

export interface CustomerNumberItem {
  id: string;
  customer_id: string;
  phone_number: string;
  normalized_phone_number: string;
  company_id: string;
  detected_prefix: string;
  status: string;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  company_name_ar?: string;
  company_code?: string;
}

export interface ProtectionPlan {
  id: string;
  company_id: string;
  name_ar: string;
  name_en?: string;
  description?: string;
  price: number;
  currency: string;
  duration_days: number;
  is_active: boolean;
  is_visible: boolean;
}

export interface PaymentMethod {
  id: string;
  name_ar: string;
  name_en?: string | null;
  code: string;
  instructions?: string | null;
  account_name?: string | null;
  account_identifier?: string | null;
  display_order: number;
  is_active: boolean;
  is_deleted?: boolean;
}

export interface ProtectionRequestItem {
  id: string;
  customer_id: string;
  customer_number_id: string;
  company_id: string;
  package_id: string;
  payment_method_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_price: number;
  requested_currency: string;
  requested_duration_days: number;
  payment_transfer_reference?: string | null;
  customer_note?: string | null;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  phone_number?: string;
  company_name_ar?: string;
  package_name?: string;
  payment_method_name?: string;
  customer_name?: string;
  customer_email?: string;
}

export interface ProtectionItem {
  id: string;
  customer_id: string;
  customer_number_id: string;
  company_id: string;
  source_request_id?: string | null;
  package_id?: string | null;
  package_name_snapshot: string;
  price_snapshot: number;
  currency_snapshot: string;
  duration_days_snapshot: number;
  task_amount_snapshot?: number | null;
  task_interval_days_snapshot?: number | null;
  task_currency_snapshot?: string | null;
  start_at: string;
  end_at: string;
  status: string;
  renewal_count?: number;
  is_deleted: boolean;
  phone_number?: string;
  company_name_ar?: string;
  customer_name?: string;
}

export interface ProtectionRenewalItem {
  id: string;
  protection_id: string;
  customer_id: string;
  package_id: string;
  price_snapshot: number;
  currency_snapshot: string;
  duration_days_snapshot: number;
  previous_end_at?: string;
  new_end_at?: string;
  payment_method_id: string;
  payment_transfer_reference?: string;
  status: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PaymentTaskItem {
  id: string;
  protection_id: string;
  customer_id: string;
  customer_number_id: string;
  company_id: string;
  task_number: number;
  task_type: string;
  amount: number;
  currency: string;
  scheduled_at: string;
  due_at: string;
  status: string;
  completed_at?: string | null;
  completed_by?: string | null;
  execution_note?: string | null;
  source_task_interval_days: number;
  created_at: string;
  phone_number?: string;
  company_name?: string;
  customer_name?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  notification_type?: string;
  title: string;
  body: string;
  related_request_id?: string;
  related_protection_id?: string;
  related_task_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_data?: any;
  new_data?: any;
  metadata?: any;
  created_at: string;
  actor_name?: string;
}

export interface SystemSettingItem {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string | null;
  is_active: boolean;
}

export interface CompanyTaskSettingItem {
  id: string;
  company_id: string;
  task_amount: number;
  task_currency: string;
  task_interval_days: number;
  enable_first_task: boolean;
  enable_recurring_tasks: boolean;
  due_visibility_days: number;
  completed_retention_days?: number;
  overdue_retention_days?: number;
  scheduled_retention_days?: number;
  allow_reschedule?: boolean;
  allow_after_expiry?: boolean;
  max_days_after_expiry?: number;
  is_active: boolean;
}
