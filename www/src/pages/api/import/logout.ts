import { pb } from '@/services/pocketbase';

export async function GET() {
    const headers: any = { "Content-Type": "text/html" };
    // delete fd_token cookie
    headers['set-cookie'] = 'fd_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;HttpOnly;SameSite=Strict';
    // set HX Location redirect
    headers['HX-Location'] = '/import/login';

    // clear the auth store on failed refresh
    pb.authStore.clear();

    const response = new Response('<p>You have been logged out</p>', { headers: headers });
    response.headers.append('set-cookie', pb.authStore.exportToCookie({ secure: false }));
    return response;
}

