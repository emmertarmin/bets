import { pb } from '@/services/pocketbase';

export async function isAuthorizedAdmin(cookies: any) {

    pb.authStore.loadFromCookie(cookies || '');

    if (pb.authStore.isValid) {
        return true;
    } else {
        return false;
    }

}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getFlag(countryCode: string) {
  const flagMap = new Map([
    ['alb', "🇦🇱"],
    ['aut', "🇦🇹"],
    ['bel', "🇧🇪"],
    ['cro', "🇭🇷"],
    ['cze', "🇨🇿"],
    ['den', "🇩🇰"],
    ['eng', "🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
    ['fra', "🇫🇷"],
    ['geo', "🇬🇪"],
    ['ger', "🇩🇪"],
    ['hun', "🇭🇺"],
    ['ita', "🇮🇹"],
    ['ned', "🇳🇱"],
    ['pol', "🇵🇱"],
    ['por', "🇵🇹"],
    ['rou', "🇷🇴"],
    ['sco', "🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
    ['srb', "🇷🇸"],
    ['svn', "🇸🇮"],
    ['svk', "🇸🇰"],
    ['esp', "🇪🇸"],
    ['sui', "🇨🇭"],
    ['tur', "🇹🇷"],
    ['ukr', "🇺🇦"]
  ])
  return flagMap.get(countryCode.toLowerCase())
}