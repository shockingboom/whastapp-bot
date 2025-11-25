import { Request, Response } from "express";
import { whatsappService } from "../services";
import { ApiResponse, MessageResult, SendMessageRequest } from "../types";
import { Logger, PhoneUtil } from "../utils";

export class MessageController {
  /**
   * Send WhatsApp message
   * POST /api/send-message
   */
  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { number, message } = req.body as SendMessageRequest;

      // Validate input
      if (!number || !message) {
        const response: ApiResponse = {
          success: false,
          message: "Number and message are required",
        };
        res.status(400).json(response);
        return;
      }

      // Validate phone number
      if (!PhoneUtil.isValidIndonesianNumber(number)) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid Indonesian phone number",
        };
        res.status(400).json(response);
        return;
      }

      const formattedNumber = PhoneUtil.formatPhoneNumber(number);
      const result = await whatsappService.sendMessage(formattedNumber, message);

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

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
