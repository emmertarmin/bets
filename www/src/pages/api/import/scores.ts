export const prerender = false;

import { pb } from "@/services/pocketbase";
// import json_data from "@/data/test_matches_finished.json";
import type { APIContext } from 'astro';

const pb_status: any[] = [];
const headers: any = { "Content-Type": "text/html" };
const today = new Date(Date.now());
const date_filter = today.toISOString().split("T");

export async function POST({ request, cookies }: APIContext) {

  // const query_params = new URL(request.url).searchParams;
  // console.log("Request params:", query_params);

  if (cookies.has('pb_auth')) {
    // auth with cookie and token
    pb.authStore.loadFromCookie(request.headers.get('cookie') || '');
    if (!pb.authStore.isValid) {
      const response = '<p>Unauthorized</p>';
      return new Response(response, { status: 401, headers: headers });
    }
  } else {
    // auth with header X-Pb-User + X-Pb-Pass
    try {
      await pb.admins.authWithPassword(request.headers.get('X-Pb-User'), request.headers.get('X-Pb-Pass'));
    } catch (err: any) {
      const response = '<p>' + (err?.response?.message || "There was an error") + '</p>';
      return new Response(response, { status: 401, headers: headers });
    }
  }

  // read fd_token cookie or from header X-Auth-Token
  const auth_token = cookies.get('fd_token')?.value || request.headers.get('X-Auth-Token') || '';

  let json_data: any = null;
  try {
    const api_response = await fetch(`http://api.football-data.org/v4/competitions/2018/matches/?status=FINISHED&dateFrom=${date_filter[0]}&dateTo=${date_filter[0]}`, {
        headers: {
            "X-Auth-Token": auth_token
        }
    });
    if (api_response.ok) {
      json_data = await api_response.json()
    } else {
      return new Response('<div class="font-mono text-xs">'+JSON.stringify(api_response)+'</div>', { status: api_response.status });  
    }
  } catch (err) {
    // console.dir(err);
    return new Response('<div class="font-mono text-xs">'+JSON.stringify(err)+'</div>', { status: 500 });
  }

  if (json_data) {
    const matches: any[] = json_data.matches;

    for(const match of matches) {
      // create data
      const matchData = new FormData();
        matchData.set('status', match.status);
        matchData.set('duration', match.score.duration);
        matchData.set('team_1_score', match.score.fullTime.home.toString() || 0);
        matchData.set('team_2_score', match.score.fullTime.away.toString() || 0);
        matchData.set('fd_id', match.id.toString());
      // console.log("match data:", matchData);
      try {
        // check if match exists, then update
        const record = await pb.collection('games').getFirstListItem(`fd_id="${match.id}"`);
        // const record = await pb.collection('games').getFirstListItem(`name="${game_name}"`);
        // console.log("Existing record:", record);
        const updRecord = await pb.collection('games').update(record.id, matchData);
        pb_status.push({ type: "game", fd_id: updRecord.fd_id, status: 'updated', date: updRecord.updated });
        // console.log("Updated record:", updRecord);
      } catch (err: any) {
        // match does not exist or something is wrong
        // console.dir(err);
        if (!(err.status && err.status == "404")) return new Response('<div class="font-mono text-xs">'+JSON.stringify(err)+'</div>', { headers: headers });
      }
    }

  }
  const body = '<p class="mb-3 text-xl">Scores updated</p><div class="font-mono text-xs">'+JSON.stringify(pb_status)+'</div>'; // body must be a string

  // await sleep(5000);

  return new Response(body, { headers: headers });

};