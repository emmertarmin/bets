import { pb, pbPOST } from "@/services/pocketbase";

export async function POST({ request, cookies }: any) {
  const pbToken = cookies.get('pbToken')?.value
  const headers: any = { "Content-Type": "text/html" }

  const formData = await request.formData()
  const formObject: any = {}
  for (const key of formData.keys()) {
    formObject[key] = formData.get(key)
  }

  try {
    const authData = await pbPOST('/api/collections/users/auth-with-password', {
      identity: formObject.email,
      password: formObject.password
    }, pbToken)

    if (!authData.ok) {
      return new Response('<p class="fadeOut">Authentication failed</p>', { status: 400, headers })
    }

    const cookieParams = new URLSearchParams()
    cookieParams.set('token', authData.data.token)
    cookieParams.set('user', authData.data.record.id)

    cookies.set('pbToken', cookieParams.toString(), { httpOnly: false, path: '/' })

    headers['HX-Location'] = '/games'

    return new Response(
      '<p class="fadeOut">Authentication successful</p>', {
        status: 200,
        headers
      }
    );
  } catch (error: any) {
    return new Response(
      `<p class="fadeOut">${error.message}</p>`, {
        status: 400,
        headers
      }
    );
  }
}