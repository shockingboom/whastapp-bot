import { Router } from "express";
import { messageController } from "../controllers";

const router = Router();

router.post("/send-message", (req, res) => messageController.sendMessage(req, res));

export const messageRoutes = router;
