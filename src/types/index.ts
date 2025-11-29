// File: src/types/index.ts
// Deskripsi: Tipe-tipe data yang digunakan di seluruh aplikasi.

// Hasil setelah mengirim pesan sukses
export interface MessageResult {
  number: string;
  message: string;
}

// Payload request untuk endpoint send-message
export interface SendMessageRequest {
  number: string;
  message: string;
}

// Format respon API umum
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Contoh tipe domain tambahan (tidak dipakai langsung oleh endpoint)
export interface TenantWithRentData {
  id: string;
  full_name: string;
  no_telp: string | null;
  rentData: {
    rent_date: Date;
  } | null;
}
