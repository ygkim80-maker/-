import { Router, Response } from 'express';
import prisma from '../../db';
import { asyncHandler } from '../../util/asyncHandler';
import { AuthRequest } from '../../middleware/auth';
import { getSystemContext, streamChat } from '../../services/aiService';

const router = Router();

interface ChatBody {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { message, history = [] } = req.body as ChatBody;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message는 필수입니다.' });
      return;
    }

    const context = await getSystemContext(prisma);

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const userId = req.user?.id || 'anonymous';

    // Persist the user message
    await prisma.aIConversation.create({
      data: { userId, role: 'user', content: message },
    });

    let full = '';
    try {
      full = await streamChat({
        message,
        history,
        context,
        onChunk: (text) => {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        },
      });
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err?.message || 'AI 오류' })}\n\n`);
    }

    // Persist assistant reply
    await prisma.aIConversation.create({
      data: { userId, role: 'assistant', content: full },
    });

    res.write('data: [DONE]\n\n');
    res.end();
  })
);

export default router;
