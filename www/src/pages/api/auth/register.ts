import { pb, pbPOST } from "@/services/pocketbase";

export const prerender = false;

export async function POST({ request, cookies }: any) {
  const pbToken = cookies.get('pbToken')?.value
  const headers: any = { "Content-Type": "text/html" };

  const formData = await request.formData()

  const formObject: any = {}
  for (const key of formData.keys()) {
    formObject[key] = formData.get(key)
  }

  if (!formObject.email) {
    return new Response('<p class="fadeOut">Email is required</p>', { status: 400, headers });
  }

  if (!formObject.password) {
    return new Response('<p class="fadeOut">Password is required</p>', { status: 400, headers });
  }

  if (!formObject.passwordConfirm) {
    return new Response('<p class="fadeOut">Password confirmation is required</p>', { status: 400, headers });
  }

  if (formObject.password !== formObject.passwordConfirm) {
    return new Response('<p class="fadeOut">Passwords do not match</p>', { status: 400, headers });
  }

  const data = {
    ...formObject,
    username: formObject.email.split('@')[0],
    emailVisibility: true
  }
  try {
    const record = await pbPOST('/api/collections/users/records', data, pbToken)

    const authData = await pbPOST('/api/collections/users/auth-with-password', {
      identity: formObject.email,
      password: formObject.password
    }, pbToken)

    // console.log(authData)

    if (!authData.ok) {
      return new Response('<p class="fadeOut">Authentication failed</p>', { status: 400, headers })
    }

    cookies.set('pbToken', authData.data.token, { httpOnly: false, path: '/' })

    headers['HX-Location'] = '/account'

    return new Response(
      '<p class="fadeOut">Registration successful</p>', { status: 200, headers });
  } catch (error: any) {
    return new Response(
      `<p class="fadeOut">${error.message}</p>`, { status: 400, headers });
  }
}