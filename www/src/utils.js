import { pb } from '@/services/pocketbase';

export async function isAuthorizedAdmin(cookies) {

    pb.authStore.loadFromCookie(cookies || '');

    if (pb.authStore.isValid) {
        return true;
    } else {
        return false;
    }

}