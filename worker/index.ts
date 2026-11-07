// Standalone Cloudflare Worker Entrypoint
import { handleApiRequest } from '../src/server/router';
import { Env } from '../src/server/types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api')) {
      return handleApiRequest(request, env);
    }
    return new Response('Comentosh Cloudflare Worker API is active.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};
