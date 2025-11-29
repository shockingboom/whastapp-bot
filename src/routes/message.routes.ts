// File: src/routes/message.routes.ts
// Deskripsi: Mendefinisikan route untuk endpoint pengiriman pesan.
import { Router } from "express";
import { messageController } from "../controllers";

const router = Router();

// POST /api/send-message
router.post("/send-message", (req, res) => messageController.sendMessage(req, res));

export const messageRoutes = router;
