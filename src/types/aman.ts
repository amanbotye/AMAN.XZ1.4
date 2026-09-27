export type UserType = 'customer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'disabled';

export type CustomerNumberStatus = 'active' | 'inactive' | 'suspended';

export type ProtectionRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type ProtectionStatus = 'active' | 'expired' | 'cancelled' | 'pending_renewal';

export type ProtectionRenewalStatus = 'pending' | 'approved' | 'rejected';

export type TaskStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'overdue' | 'cancelled';

export type PaymentVerificationStatus = 'pending' | 'verified' | 'rejected';

export type TransactionType = 'income' | 'expense' | 'refund' | 'adjustment';

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  user_type: UserType;
  status: UserStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export type User = UserProfile;
export type Company = TelecomCompany;

export interface TelecomCompany {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyPrefix {
  id: string;
  company_id: string;
  prefix: string;
  number_length: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyPackage {
  id: string;
  company_id: string;
  name_ar: string;
  name_en: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  is_active: boolean;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  instructions: string | null;
  account_name: string | null;
  account_identifier: string | null;
  display_order: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerNumber {
  id: string;
  customer_id: string;
  phone_number: string;
  normalized_phone_number: string;
  company_id: string;
  detected_prefix: string | null;
  status: CustomerNumberStatus;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  company?: TelecomCompany;
}

export interface ProtectionRequest {
  id: string;
  customer_id: string;
  customer_number_id: string;
  company_id: string;
  package_id: string;
  payment_method_id: string;
  status: ProtectionRequestStatus;
  requested_price: number;
  requested_currency: string;
  requested_duration_days: number;
  payment_transfer_reference: string;
  customer_note: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  customer_number?: CustomerNumber;
  company?: TelecomCompany;
  package?: CompanyPackage;
  payment_method?: PaymentMethod;
}

export interface Protection {
  id: string;
  customer_id: string;
  customer_number_id: string;
  company_id: string;
  source_request_id: string | null;
  package_id: string;
  package_name_snapshot: string | null;
  price_snapshot: number;
  currency_snapshot: string;
  duration_days_snapshot: number;
  task_amount_snapshot: number | null;
  task_interval_days_snapshot: number | null;
  task_currency_snapshot: string | null;
  start_at: string;
  end_at: string;
  status: ProtectionStatus;
  renewal_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  customer_number?: CustomerNumber;
  company?: TelecomCompany;
  package?: CompanyPackage;
}

export interface ProtectionRenewal {
  id: string;
  protection_id: string;
  customer_id: string;
  package_id: string;
  price_snapshot: number;
  currency_snapshot: string;
  duration_days_snapshot: number;
  previous_end_at: string;
  new_end_at: string | null;
  payment_method_id: string;
  payment_transfer_reference: string;
  status: ProtectionRenewalStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  protection?: Protection;
  package?: CompanyPackage;
  payment_method?: PaymentMethod;
}

export interface ProtectionTask {
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
  status: TaskStatus;
  completed_at: string | null;
  completed_by: string | null;
  execution_note: string | null;
  source_task_interval_days: number | null;
  created_at: string;
  updated_at: string;
  // Joins
  protection?: Protection;
  customer_number?: CustomerNumber;
  company?: TelecomCompany;
}

export interface ManualPaymentLog {
  id: string;
  request_id: string | null;
  renewal_id: string | null;
  payment_method_id: string;
  transfer_reference: string;
  amount: number;
  verification_status: PaymentVerificationStatus;
  verified_by: string | null;
  verified_at: string | null;
  verification_note: string | null;
  created_at: string;
  // Joins
  payment_method?: PaymentMethod;
}

export interface ClientNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  related_request_id: string | null;
  related_protection_id: string | null;
  related_task_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  related_request_id: string | null;
  related_protection_id: string | null;
  related_task_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: any;
  new_data: any;
  metadata: any;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyTaskSettings {
  id: string;
  company_id: string;
  task_amount: number;
  task_currency: string;
  task_interval_days: number;
  enable_first_task: boolean;
  enable_recurring_tasks: boolean;
  due_visibility_days: number;
  completed_retention_days: number;
  overdue_retention_days: number;
  scheduled_retention_days: number;
  allow_reschedule: boolean;
  allow_after_expiry: boolean;
  max_days_after_expiry: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanySubscriptionSettings {
  id: string;
  company_id: string;
  renewal_enabled: boolean;
  renewal_visibility_days: number;
  expiry_notifications_enabled: boolean;
  notify_days_before_expiry: number;
  allow_task_after_expiry: boolean;
  max_task_days_after_expiry: number;
  expiry_extension_rules: any;
  created_at: string;
  updated_at: string;
}

// Standard RPC Result Shape
export interface RpcResult<T = any> {
  success: boolean;
  error_code?: string;
  message?: string;
  id?: string;
  next_task_id?: string;
  new_end_at?: string;
  manual_payment_log_id?: string;
  data?: T;
}
