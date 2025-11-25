export interface MessageResult {
  number: string;
  message: string;
}

export interface SendMessageRequest {
  number: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface TenantWithRentData {
  id: string;
  full_name: string;
  no_telp: string | null;
  rentData: {
    rent_date: Date;
  } | null;
}
