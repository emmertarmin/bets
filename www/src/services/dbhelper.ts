import { pbGET, pbPATCH } from "@/services/pocketbase";

export function getUserId(cookie: string) {
    const cookieParams = new URLSearchParams(cookie);
    const id = cookieParams.get("user") || '~'; // do not set blank otherwise all users are returned
    return id;
}

export const getUser = async (pbToken: string) => {
    return await pbGET(`/api/collections/users/records/${getUserId(pbToken)}`, {
        perPage: 200
    }, pbToken).then((res) => res.data);
}

export const updateUser = async(pbToken: string, data: any) => {
    // console.log(pbToken, data);
    return await pbPATCH(`/api/collections/users/records/${getUserId(pbToken)}`
    , data
    , pbToken).then((res) => res );
}

export const getAllUsers = async (pbToken: string) => {
    return pbGET("/api/collections/users/records", {
        perPage: 500 // 500 is the hard limit
    }, pbToken).then((res) => res.data.items.toSorted((a: any, b: any) => ((b.points - a.points) || (a.username.localeCompare(b.username)))));
}

export const getMatches = async (pbToken: string) => {
    return await pbGET('/api/collections/games/records', {
        sort: 'date',
        expand: 'team_1,team_2',
        perPage: 500 // 500 is the hard limit
    }, pbToken).then(res => res.data.items)
}

export const getAllBets = async (pbToken: string) => {
    const betsData = await pbGET('/api/collections/bets/records', {
        perPage: 500, // 500 is the hard limit
        expand: 'user,game'
    }, pbToken).then(res => res.data)
    if (betsData.totalPages === 1) return betsData.items
    for (const page of Array.from({ length: betsData.totalPages - 1 }, (_, i) => i + 2)) {
        const pageData = await pbGET('/api/collections/bets/records', {
            perPage: 500, // 500 is the hard limit
            page,
            expand: 'user,game'
        }, pbToken).then(res => res.data)
        betsData.items.push(...pageData.items)
    }
    return betsData.items
}

export const getUserBets = async (pbToken: string) => {
    return await pbGET('/api/collections/bets/records', {
        filter: `user="${getUserId(pbToken)}"`,
        perPage: 500 // 500 is the hard limit
    }, pbToken).then(res => res.data.items)
}

export const getGroups = async (pbToken: string) => {
    return await pbGET('/api/collections/groups/records', {
        sort: 'name',
        expand: 'team_1,team_2,team_3,team_4',
        perPage: 500 // 500 is the hard limit
    }, pbToken).then(res => res.data.items)
}