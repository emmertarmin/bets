import { pbGET } from "@/services/pocketbase";

export function getUserId(cookie: string) {
    const cookieParams = new URLSearchParams(cookie);
    const id = cookieParams.get("user") || '';
    return id;
}

export const getUser = async(pbToken: string) => {
    return await pbGET(`/api/collections/users/records/${getUserId(pbToken)}`, {}
    , pbToken).then((res) => res.data);
}

export const getAllUsers = async(pbToken: string) => {
    return pbGET("/api/collections/users/records", {}
    , pbToken).then((res) => res.data.items.toSorted((a: any, b: any) => ((b.points - a.points) || (a.username.localeCompare(b.username)))));
}
  
export const getMatches = async (pbToken: string) => {
    return await pbGET('/api/collections/games/records', {
        sort: 'date',
        expand: 'team_1,team_2',
        perPage: 100
    }, pbToken).then(res => res.data.items)
}

export const getUserBets = async(pbToken: string) => {
    return await pbGET('/api/collections/bets/records', {
        filter: `user="${getUserId(pbToken)}"`
    }, pbToken).then(res => res.data.items)    
}
