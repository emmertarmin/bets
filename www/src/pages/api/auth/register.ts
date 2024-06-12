import { pb, pbPOST } from "@/services/pocketbase";

export async function POST({ request, cookies }: any) {

  const headers: any = { "Content-Type": "text/html" };

  const formData = await request.formData()

  const formObject: any = {}
  for (const key of formData.keys()) {
    formObject[key] = formData.get(key)
  }

  if (!formObject.email) {
    return new Response('<p class="fadeOut">Email is required</p>', { status: 400, headers });
  }

  if (!formObject.username) {
    return new Response('<p class="fadeOut">Name is required</p>', { status: 400, headers });
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
    username: formObject.username || formObject.email.split('@')[0],
    emailVisibility: true
  }
  try {
    const record = await pbPOST('/api/collections/users/records', data)

    if (!record.ok) {
      return new Response('<p class="fadeOut">Registration failed</p>', { status: 400, headers });
    }

    const authData = await pbPOST('/api/collections/users/auth-with-password', {
      identity: formObject.email,
      password: formObject.password
    })

    // console.log(authData)

    if (!authData.ok) {
      return new Response('<p class="fadeOut">Authentication failed</p>', { status: 400, headers })
    }

    const cookieParams = new URLSearchParams()
    cookieParams.set('token', authData.data.token)
    cookieParams.set('user', authData.data.record.id)

    cookies.set('pbToken', cookieParams.toString(), { httpOnly: false, path: '/' })

    headers['HX-Location'] = '/account'

    return new Response(
      '<p class="fadeOut">Registration successful</p>', { status: 200, headers });
  } catch (error: any) {
    return new Response(
      `<p class="fadeOut">${error.message}</p>`, { status: 400, headers });
  }
}