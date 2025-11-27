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

    // 🚀 Keep Railway alive
    setInterval(() => {
      if (config.serverUrl) {
        fetch(`${config.serverUrl}/ping`).catch(() => {});
      }
    }, 1000 * 60 * 4); // every 4 minutes
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private setupEventHandlers(): void {
    this.client.on("qr", (qrCode: string) => {
      qr.generate(qrCode, { small: true });
      Logger.info("QR Code generated, scan it with your phone.");
    });

    this.client.on("authenticated", () => {
      Logger.info("Authenticated successfully!");
    });

    this.client.on("ready", () => {
      Logger.info("WhatsApp client is ready!");
      this.isReady = true;
    });

    this.client.on("message", async (message: Message) => {
      await this.handleIncomingMessage(message);
    });

    this.client.on("disconnected", async (reason: string) => {
      Logger.warn("WhatsApp client disconnected", { reason });
      this.isReady = false;

      Logger.info("Attempting to auto reconnect...");
      await this.reconnect();
    });

    // 🛡 Prevent WhatsApp session freeze
    setInterval(async () => {
      if (this.isReady) {
        try {
          await this.client.sendPresenceAvailable();
        } catch (_) {}
      }
    }, 1000 * 60 * 2); // every 2 mins
  }

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

  private async handleIncomingMessage(message: Message): Promise<void> {
    if (message.body === "!ping") {
      await message.reply("pong");
    }
  }

  public async initialize(): Promise<void> {
    await this.client.initialize();
  }

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

  public isClientReady(): boolean {
    return this.isReady;
  }

  public async destroy(): Promise<void> {
    await this.client.destroy();
    this.isReady = false;
  }
}

export const whatsappService = WhatsAppService.getInstance();
