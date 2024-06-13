import { pb } from '@/services/pocketbase';
import { type APIContext } from 'astro';

export async function POST({ request }: APIContext) {
    const formData = await request.formData();
    const headers: any = { "Content-Type": "text/html" };

    const formObject: any = {}
    for (const key of formData.keys()) {
      formObject[key] = formData.get(key)
    }
    let response_message: any = "<p>You are logged in</p>";
    try {
        await pb.admins.authWithPassword(formObject.email, formObject.password);
        if (formObject.apikey.trim().length > 0) {
            const d = new Date();
            d.setTime(d.getTime() + (14*24*60*60*1000));
            let expires = "expires="+ d.toUTCString();
            headers['set-cookie'] = 'fd_token=' + formObject.apikey.trim() + ';' + expires + ';path=/;HttpOnly;SameSite=Strict';
        }
        // set HX Location redirect
        headers['HX-Location'] = '/import';
    } catch (err: any) {
        response_message = '<p>' + (err?.response?.message || "There was an error") + '</p>';
        // clear the auth store on failed refresh
        pb.authStore.clear();
    }

    const response = new Response(response_message, { headers: headers });
    response.headers.append('set-cookie', pb.authStore.exportToCookie({ secure: false }));
    return response;
}

