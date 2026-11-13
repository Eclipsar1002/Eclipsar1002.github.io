import { getCollection } from 'astro:content';
import { getEntryTitle } from '../../utils/content';
export const prerender = true;
export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return new Response(JSON.stringify(posts.map(post => ({
    id: post.id, title: getEntryTitle(post), folder: post.id.split('/').slice(0, -1).join('/'),
  }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
