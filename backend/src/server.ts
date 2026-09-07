import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { availabilityRouter } from './routes/availability.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { contentRouter } from './routes/content.routes.js';
import { contactRouter } from './routes/contact.routes.js';

const app = express();
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.use(helmet({
  xFrameOptions: false,
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'self'", env.CLIENT_URL],
    },
  },
}));
app.use(cors({
  origin: (origin, callback) => {
    const isLocalDevelopmentOrigin = env.NODE_ENV === 'development'
      && !!origin
      && /^https?:\/\/localhost:\d+$/.test(origin);
    if (!origin || origin === env.CLIENT_URL || isLocalDevelopmentOrigin) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.SESSION_SECRET));
app.use('/uploads', express.static(path.join(backendRoot, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/profile', profileRouter);
app.use('/api/content', contentRouter);
app.use('/api/contact', contactRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'portfolio-backend',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'Portfolio API is running',
    routes: ['/api/health'],
  });
});

export default app;

if (process.env.VERCEL !== '1') {
  app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}
