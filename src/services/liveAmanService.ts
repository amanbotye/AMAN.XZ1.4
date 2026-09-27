import { supabase } from './supabaseClient';
import {
  Company,
  CompanyPackage,
  CompanyPrefix,
  PaymentMethod,
  CustomerNumber,
  ProtectionRequest,
  Protection,
  ProtectionTask,
  ProtectionRenewal,
  ManualPaymentLog,
  ClientNotification,
  User
} from '../types/aman';

export interface RpcResult {
  success: boolean;
  error_code?: string;
  message?: string;
  data?: any;
  [key: string]: any;
}

class LiveAmanService {
  // 1. Fetch current authenticated session
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  // 2. Fetch current user profile from 'users' table
  async getCurrentUserProfile(): Promise<User | null> {
    const session = await this.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !data) {
      // Fallback object from session if user profile row is not created yet
      return {
        id: session.user.id,
        user_type: (session.user.user_metadata?.user_type as any) || 'customer',
        status: 'active',
        email: session.user.email || null,
        username: session.user.email?.split('@')[0] || null,
        full_name: session.user.user_metadata?.full_name || null,
        is_deleted: false,
        created_at: session.user.created_at,
        updated_at: session.user.created_at
      };
    }

    return data as User;
  }

  // 3. Companies & Prefixes
  async getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return data as Company[];
  }

  async getPrefixes(): Promise<CompanyPrefix[]> {
    const { data, error } = await supabase
      .from('company_prefixes')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false);

    if (error || !data) return [];
    return data as CompanyPrefix[];
  }

  // 4. Packages
  async getPackages(companyId?: string): Promise<CompanyPackage[]> {
    let query = supabase
      .from('company_packages')
      .select('*')
      .eq('is_active', true)
      .eq('is_visible', true)
      .eq('is_deleted', false)
      .order('duration_days', { ascending: true });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as CompanyPackage[];
  }

  // 5. Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return data as PaymentMethod[];
  }

  // 6. Customer Numbers
  async getCustomerNumbers(): Promise<CustomerNumber[]> {
    const { data, error } = await supabase
      .from('customer_numbers')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as CustomerNumber[];
  }

  // 7. Customer Protection Requests
  async getProtectionRequests(): Promise<ProtectionRequest[]> {
    const { data, error } = await supabase
      .from('protection_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as ProtectionRequest[];
  }

  // 8. Protections
  async getProtections(): Promise<Protection[]> {
    const { data, error } = await supabase
      .from('protections')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Protection[];
  }

  // 9. Renewals
  async getRenewals(): Promise<ProtectionRenewal[]> {
    const { data, error } = await supabase
      .from('protection_renewals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as ProtectionRenewal[];
  }

  // 10. Protection Tasks (For Admin)
  async getProtectionTasks(): Promise<ProtectionTask[]> {
    const { data, error } = await supabase
      .from('protection_tasks')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error || !data) return [];
    return data as ProtectionTask[];
  }

  // 11. Payment Logs (For Admin)
  async getPaymentLogs(): Promise<ManualPaymentLog[]> {
    const { data, error } = await supabase
      .from('manual_payment_logs')
      .select('*')
      .order('verified_at', { ascending: false });

    if (error || !data) return [];
    return data as ManualPaymentLog[];
  }

  // 12. Client Notifications
  async getNotifications(): Promise<ClientNotification[]> {
    const { data, error } = await supabase
      .from('client_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as ClientNotification[];
  }

  // ==========================================
  // REAL STORED PROCEDURES (RPCS)
  // ==========================================

  // RPC: normalize_phone(p_raw)
  async rpcNormalizePhone(rawPhone: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('normalize_phone', { p_raw: rawPhone });
      if (error || !data) {
        return rawPhone.replace(/\D/g, '').replace(/^(00967|\+967|967|0)/, '');
      }
      return data;
    } catch {
      return rawPhone.replace(/\D/g, '').replace(/^(00967|\+967|967|0)/, '');
    }
  }

  // RPC: detect_company_from_phone(p_normalized_phone)
  async rpcDetectCompany(normalizedPhone: string): Promise<{ company_id: string; prefix: string; number_length: number } | null> {
    try {
      const { data, error } = await supabase.rpc('detect_company_from_phone', {
        p_normalized_phone: normalizedPhone
      });
      if (error || !data || !data.length) return null;
      return data[0];
    } catch {
      return null;
    }
  }

  // RPC: rpc_add_customer_number(p_phone_number)
  async rpcAddCustomerNumber(phoneNumber: string): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_add_customer_number', {
      p_phone_number: phoneNumber
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_create_protection_request
  async rpcCreateProtectionRequest(
    customerNumberId: string,
    packageId: string,
    paymentMethodId: string,
    transferReference: string,
    customerNote?: string
  ): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_create_protection_request', {
      p_customer_number_id: customerNumberId,
      p_package_id: packageId,
      p_payment_method_id: paymentMethodId,
      p_transfer_reference: transferReference,
      p_customer_note: customerNote || null
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_create_renewal_request
  async rpcCreateRenewalRequest(
    protectionId: string,
    packageId: string,
    paymentMethodId: string,
    transferReference: string
  ): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_create_renewal_request', {
      p_protection_id: protectionId,
      p_package_id: packageId,
      p_payment_method_id: paymentMethodId,
      p_transfer_reference: transferReference
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_verify_manual_payment (Admin)
  async rpcVerifyManualPayment(
    requestId?: string,
    renewalId?: string,
    status: 'verified' | 'rejected' = 'verified',
    note?: string
  ): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_verify_manual_payment', {
      p_request_id: requestId || null,
      p_renewal_id: renewalId || null,
      p_verification_status: status,
      p_verification_note: note || null
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_approve_protection_request (Admin)
  async rpcApproveProtectionRequest(requestId: string): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_approve_protection_request', {
      p_request_id: requestId
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_reject_protection_request (Admin)
  async rpcRejectProtectionRequest(requestId: string, reason: string): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_reject_protection_request', {
      p_request_id: requestId,
      p_rejection_reason: reason
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_approve_renewal (Admin)
  async rpcApproveRenewal(renewalId: string): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_approve_renewal', {
      p_renewal_id: renewalId
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_reject_renewal (Admin)
  async rpcRejectRenewal(renewalId: string, reason: string): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_reject_renewal', {
      p_renewal_id: renewalId,
      p_rejection_reason: reason
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_execute_task (Admin)
  async rpcExecuteTask(taskId: string, executionNote?: string): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_execute_task', {
      p_task_id: taskId,
      p_execution_note: executionNote || null
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // RPC: rpc_mark_notification_read
  async rpcMarkNotificationRead(notificationId: string): Promise<RpcResult> {
    const { data, error } = await supabase.rpc('rpc_mark_notification_read', {
      p_notification_id: notificationId
    });

    if (error) {
      return { success: false, error_code: error.message };
    }
    return data as RpcResult;
  }

  // Check if current user is admin
  async rpcIsAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) return false;
      return Boolean(data);
    } catch {
      return false;
    }
  }

  // Sign out
  async signOut() {
    await supabase.auth.signOut();
  }
}

export const liveAmanService = new LiveAmanService();
