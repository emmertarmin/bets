import { pb } from "@/services/pocketbase";

export const prerender = false;

export async function POST({ request, cookies }: any) {
  // if backend detects that request is coming from HTMX (by checking if HX-Request request header exists), it responds with HX-Location redirection, and if not it responds with Location header.
  const headers: any = { "Content-Type": "text/html" };
  // if (request.headers.get('HX-Request')) {
  //   headers['HX-Location'] = '/auth/login';
  // }


  const formData = await request.formData()

  const formObject: any = {}
  for (const key of formData.keys()) {
    formObject[key] = formData.get(key)
  }

  if (!formObject.email) {
    return new Response('<p>Email is required</p>', { status: 400, headers });
  }

  if (!formObject.password) {
    return new Response('<p>Password is required</p>', { status: 400, headers });
  }

  if (!formObject.passwordConfirm) {
    return new Response('<p>Password confirmation is required</p>', { status: 400, headers });
  }

  if (formObject.password !== formObject.passwordConfirm) {
    return new Response('<p>Passwords do not match</p>', { status: 400, headers });
  }

  const data = {
    ...formObject,
    username: formObject.email.split('@')[0],
    emailVisibility: true
  }

  const record = await pb.collection('users').create(data);

  const authData = await pb.collection('users').authWithPassword(
    record.email,
    formObject.password
  );

  if (!authData) {
    return new Response('<p>Authentication failed</p>', { status: 401, headers });
  }

  cookies.set('token', authData.token, { httpOnly: false });

  return new Response(
    `<pre>${JSON.stringify({record, authData}, null, 2)}</pre>`, { status: 200, headers });
}