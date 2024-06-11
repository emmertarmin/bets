import { pb } from "@/services/pocketbase";

export const prerender = false;



export async function POST({ cookies }: any) {
  const headers: any = { "Content-Type": "text/html" };

  pb.authStore.clear();

  cookies.delete('pbToken');

  headers['HX-Location'] = '/login';

  return new Response(
    '', { status: 200, headers });
}