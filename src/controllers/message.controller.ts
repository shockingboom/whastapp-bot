import { Request, Response } from "express";
import { whatsappService } from "../services";
import { ApiResponse, MessageResult, SendMessageRequest } from "../types";
import { Logger, PhoneUtil } from "../utils";

/**
 * Controller untuk endpoint pesan.
 * Tanggung jawab:
 * - Validasi payload
 * - Memformat nomor telepon
 * - Memanggil service untuk mengirim pesan
 * - Memetakan error ke HTTP status yang sesuai
 */
export class MessageController {
  /**
   * POST /api/send-message
   * Mengirim pesan WhatsApp ke nomor yang diberikan.
   * Validasi yang dilakukan:
   * - number dan message wajib
   * - number divalidasi sebagai nomor Indonesia
   */
  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { number, message } = req.body as SendMessageRequest;

      // Validasi input
      if (!number || !message) {
        const response: ApiResponse = {
          success: false,
          message: "Number and message are required",
        };
        res.status(400).json(response);
        return;
      }

      // Validasi nomor telepon (Indonesia)
      if (!PhoneUtil.isValidIndonesianNumber(number)) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid Indonesian phone number",
        };
        res.status(400).json(response);
        return;
      }

      // Format nomor ke bentuk internasional (62...)
      const formattedNumber = PhoneUtil.formatPhoneNumber(number);

      // Pastikan client WhatsApp siap
      if (!whatsappService.isClientReady()) {
        const response: ApiResponse = {
          success: false,
          message: "WhatsApp client is not ready. Try again later.",
        };
        res.status(503).json(response);
        return;
      }

      // Kirim pesan dengan timeout untuk mencegah hang
      const sendPromise = whatsappService.sendMessage(formattedNumber, message);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("send_timeout")), 15000)
      );

      const result = await Promise.race([sendPromise, timeoutPromise]);

      Logger.info("Message sent successfully", {
        number: formattedNumber,
        messageLength: message.length,
      });

      const response: ApiResponse<MessageResult> = {
        success: true,
        message: "Message sent successfully",
        data: result,
      };

      res.json(response);
    } catch (error) {
      Logger.error("Error sending message", error);

      // Map timeout ke 504, selain itu 500
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage === "send_timeout") {
        const response: ApiResponse = {
          success: false,
          message: "Message sending timed out",
          error: errorMessage,
        };
        res.status(504).json(response);
        return;
      }

      const response: ApiResponse = {
        success: false,
        message: "Failed to send message",
        error: errorMessage,
      };

      res.status(500).json(response);
    }
  }
}

export const messageController = new MessageController();
