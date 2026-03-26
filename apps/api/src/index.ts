import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { APP_NAME } from '@contractorpro/shared';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import estimateRoutes from './routes/estimates.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: APP_NAME });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/estimates', estimateRoutes);

app.listen(PORT, () => {
  console.log(`${APP_NAME} API running on http://localhost:${PORT}`);
});
