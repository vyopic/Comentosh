// Cloudflare Pages Functions Catch-all Router (/api/*)
import { handleApiRequest } from '../../src/server/router';
import { Env } from '../../src/server/types';

interface PagesContext {
  request: Request;
  env: Env;
  params: { path: string[] };
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  return handleApiRequest(context.request, context.env);
};
