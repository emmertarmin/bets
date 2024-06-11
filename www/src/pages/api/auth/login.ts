import { pb } from "@/services/pocketbase";

export const prerender = false;

export async function POST({ request, cookies }: any) {
  const headers: any = { "Content-Type": "text/html" };

  const formData = await request.formData()
  const formObject: any = {}
  for (const key of formData.keys()) {
    formObject[key] = formData.get(key)
  }

  try {
    const authData = await pb.collection('users').authWithPassword(
      formObject.email,
      formObject.password
    );
    if (!authData) {
      return new Response('<p>Authentication failed</p>', { status: 400, headers });
    }

    cookies.set('token', authData.token, { httpOnly: false });

    headers['HX-Location'] = '/auth/account';

    return new Response(
      '<p>Authentication successful</p>', {
        status: 200,
        headers
      }
    );
  } catch (error: any) {
    return new Response(
      `<p>${error.message}</p>`, {
        status: 400,
        headers
      }
    );
  }
}