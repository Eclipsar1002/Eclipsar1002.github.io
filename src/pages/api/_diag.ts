import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const u = new URL(request.url);
  return new Response(
    JSON.stringify({
      raw: request.url,
      search: u.search,
      params: [...new URLSearchParams(u.search).entries()],
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
