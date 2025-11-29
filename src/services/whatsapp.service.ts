// File: src/services/whatsapp.service.ts
// Deskripsi: Wrapper untuk `whatsapp-web.js` Client. Mengelola lifecycle
// client, event handler, dan menyediakan method publik untuk mengirim pesan.
import * as qr from "qrcode-terminal";
import { Client, LocalAuth, Message } from "whatsapp-web.js";
import { config } from "../config";
import { MessageResult } from "../types";
import { Logger } from "../utils";
import fetch from "node-fetch";

export class WhatsAppService {
  private static instance: WhatsAppService;
  private client: Client;
  private isReady: boolean = false;

  private constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: config.whatsapp.puppeteerOptions,
    });

    this.setupEventHandlers();

    // Periodik ping ke server (opsional) untuk menjaga host tetap "alive"
    setInterval(() => {
      if (config.server.serverUrl) {
        fetch(`${config.server.serverUrl}/ping`).catch(() => {});
      }
    }, 1000 * 60 * 4); // setiap 4 menit
  }

  /** Singleton accessor */
  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /** Pasang event handler untuk client whatsapp */
  private setupEventHandlers(): void {
    // Ketika QR code dihasilkan, tampilkan di terminal agar user bisa scan
    this.client.on("qr", (qrCode: string) => {
      qr.generate(qrCode, { small: true });
      Logger.info("QR Code generated, scan it with your phone.");
    });

    this.client.on("authenticated", () => {
      Logger.info("Authenticated successfully!");
    });

    // Ketika client siap digunakan
    this.client.on("ready", () => {
      Logger.info("WhatsApp client is ready!");
      this.isReady = true;
    });

    // Tangani pesan masuk sederhana (contoh ping)
    this.client.on("message", async (message: Message) => {
      await this.handleIncomingMessage(message);
    });

    // Tangani disconnect dan coba reconnect otomatis
    this.client.on("disconnected", async (reason: string) => {
      Logger.warn("WhatsApp client disconnected", { reason });
      this.isReady = false;

      Logger.info("Attempting to auto reconnect...");
      await this.reconnect();
    });

    // Prevent session freeze: kirim presence secara periodik
    setInterval(async () => {
      if (this.isReady) {
        try {
          await this.client.sendPresenceAvailable();
        } catch (_) {}
      }
    }, 1000 * 60 * 2); // setiap 2 menit
  }

  /** Recreate client dan inisialisasi ulang */
  private async reconnect(): Promise<void> {
    try {
      await this.client.destroy();
    } catch (_) {}

    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: config.whatsapp.puppeteerOptions,
    });

    this.setupEventHandlers();

    setTimeout(async () => {
      Logger.info("Reinitializing WhatsApp client...");
      await this.initialize();
    }, 3000);
  }

  /** Tangani pesan masuk sederhana (extend sesuai kebutuhan) */
  private async handleIncomingMessage(message: Message): Promise<void> {
    if (message.body === "!ping") {
      await message.reply("pong");
    }
  }

  /** Inisialisasi client whatsapp (harus dipanggil sekali saat bootstrap) */
  public async initialize(): Promise<void> {
    await this.client.initialize();
  }

  /**
   * Kirim pesan ke nomor (format: 628...) dan kembalikan MessageResult
   * Melempar error jika client belum siap atau pengiriman gagal.
   */
  public async sendMessage(phoneNumber: string, message: string): Promise<MessageResult> {
    if (!this.isReady) {
      throw new Error("WhatsApp client is not ready");
    }

    try {
      const chatId = `${phoneNumber}@c.us`;
      await this.client.sendMessage(chatId, message);
      return {
        number: phoneNumber,
        message,
      };
    } catch (error) {
      Logger.error("Error sending message", error);
      throw error;
    }
  }

  /** Cek apakah client sudah siap */
  public isClientReady(): boolean {
    return this.isReady;
  }

  /** Hentikan client dan bersihkan resource */
  public async destroy(): Promise<void> {
    await this.client.destroy();
    this.isReady = false;
  }
}

export const whatsappService = WhatsAppService.getInstance();
