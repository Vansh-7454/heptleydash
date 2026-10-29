import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import app from '../../server/app';
// @ts-ignore
import { connectDB } from '../../server/config/db';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    return app(req, res);
  } catch (err: any) {
    console.error('[API Handler Error]', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
    }
  }
}
