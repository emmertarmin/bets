import { pb, pbPOST } from "@/services/pocketbase";

export const prerender = false;

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

    // console.log(authData)

    if (!authData.ok) {
      return new Response('<p class="fadeOut">Authentication failed</p>', { status: 400, headers })
    }

    cookies.set('pbToken', authData.data.token, { httpOnly: false, path: '/' })

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