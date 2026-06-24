import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

interface Question {
  id: string;
  text: string;
  author: string;
  likes: number;
  likedBy: Set<string>;
  createdAt: Date;
  pinned: boolean;
  answered: boolean;
}

interface QASession {
  id: string;
  title: string;
  createdAt: Date;
  active: boolean;
  questions: Question[];
}

const sessions = new Map<string, QASession>();

router.post('/', (req: Request, res: Response) => {
  const { title } = req.body;
  const id = crypto.randomBytes(4).toString('hex');
  const session: QASession = {
    id,
    title: title || '실시간 Q&A',
    createdAt: new Date(),
    active: true,
    questions: [],
  };
  sessions.set(id, session);
  res.json(session);
});

router.get('/:id', (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: '세션을 찾을 수 없습니다' });
  res.json({
    ...session,
    questions: session.questions.map((q) => ({ ...q, likedBy: undefined })),
  });
});

router.post('/:id/questions', (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: '세션을 찾을 수 없습니다' });
  if (!session.active) return res.status(400).json({ error: '종료된 세션입니다' });

  const { text, author } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: '질문을 입력해주세요' });

  const question: Question = {
    id: crypto.randomBytes(4).toString('hex'),
    text: text.trim(),
    author: (author || '익명').trim(),
    likes: 0,
    likedBy: new Set(),
    createdAt: new Date(),
    pinned: false,
    answered: false,
  };
  session.questions.push(question);

  const { io } = require('../../services/socketService');
  if (io) {
    io.to(`qa:${session.id}`).emit('qa:new-question', {
      ...question,
      likedBy: undefined,
    });
  }

  res.json({ ...question, likedBy: undefined });
});

router.post('/:id/questions/:qid/like', (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: '세션을 찾을 수 없습니다' });

  const question = session.questions.find((q) => q.id === req.params.qid);
  if (!question) return res.status(404).json({ error: '질문을 찾을 수 없습니다' });

  const clientId = req.body.clientId || req.ip;
  if (question.likedBy.has(clientId)) {
    question.likedBy.delete(clientId);
    question.likes--;
  } else {
    question.likedBy.add(clientId);
    question.likes++;
  }

  const { io } = require('../../services/socketService');
  if (io) {
    io.to(`qa:${session.id}`).emit('qa:question-updated', {
      id: question.id,
      likes: question.likes,
      pinned: question.pinned,
      answered: question.answered,
    });
  }

  res.json({ likes: question.likes });
});

router.patch('/:id/questions/:qid', (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: '세션을 찾을 수 없습니다' });

  const question = session.questions.find((q) => q.id === req.params.qid);
  if (!question) return res.status(404).json({ error: '질문을 찾을 수 없습니다' });

  if (req.body.pinned !== undefined) question.pinned = req.body.pinned;
  if (req.body.answered !== undefined) question.answered = req.body.answered;

  const { io } = require('../../services/socketService');
  if (io) {
    io.to(`qa:${session.id}`).emit('qa:question-updated', {
      id: question.id,
      likes: question.likes,
      pinned: question.pinned,
      answered: question.answered,
    });
  }

  res.json({ ...question, likedBy: undefined });
});

router.patch('/:id', (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: '세션을 찾을 수 없습니다' });

  if (req.body.active !== undefined) session.active = req.body.active;

  const { io } = require('../../services/socketService');
  if (io) {
    io.to(`qa:${session.id}`).emit('qa:session-updated', { active: session.active });
  }

  res.json(session);
});

export default router;
