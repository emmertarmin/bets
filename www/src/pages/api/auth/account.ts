import { updateUser } from "@/services/dbhelper";

export async function POST({ request, cookies }: any) {

  const headers: any = { "Content-Type": "text/html" };

  const formData = await request.formData()

  const formObject: any = {}
  for (const key of formData.keys()) {
    formObject[key] = formData.get(key)
  }
  // do form SSR validation
  if (!formObject.email) {
    return new Response('<p class="fadeOut">Email is required</p>', { status: 400, headers });
  }

  if (formObject.emailVisibility) {
    formObject.emailVisibility="true";
  } else {
    formObject.emailVisibility="false";
  }

  if (!formObject.username || formObject.username.trim().length == 0) {
    return new Response('<p class="fadeOut">Name is required</p>', { status: 400, headers });
  }

  if (!formObject.password || formObject.password.trim().length == 0) {
    delete formObject.password;
    delete formObject.passwordConfirm;
  }

  if (formObject.password?.trim().length > 0 && formObject.password !== formObject.passwordConfirm) {
    return new Response('<p class="fadeOut">Passwords do not match</p>', { status: 400, headers });
  }

  try {
    const record = await updateUser(cookies.get('pbToken')?.value, formObject);

    if (!record.ok) {
      return new Response('<p class="fadeOut">Updated failed</p>', { status: 400, headers });
    }

    return new Response(
      '<p class="fadeOut">Update successfull</p>', { status: 200, headers });
  } catch (error: any) {
    return new Response(
      `<p class="fadeOut">${error.message}</p>`, { status: 400, headers });
  }
}