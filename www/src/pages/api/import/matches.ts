export const prerender = false;

import { pb } from "@/services/pocketbase";
// import json_data from "@/data/matches_scheduled.json";
import type { APIContext } from 'astro';

/*
interface Match {
  homeTeam: Team;
  awayTeam: Team;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  score: {
    duration: string;
  };
  id: number;
}
*/
interface Competition {
  name: string;
  code: string;
  type: string;
  emblem: string;
  id: number;
}

let pb_status: any[], headers: any;

async function check_team(team: any) {
  let record: any = team;
  // create data
  const data = new FormData();
    data.set('name', team.name);
    data.set('country_code_3', team.tla.toLowerCase());
  if (team.crest.length > 0) {
    data.set('crest', team.tla.toLowerCase() + '.' + team.crest.split('.').pop());
  }
  // console.log("team data:", data);
  try {
    // check if team exists
    record = await pb.collection('teams').getFirstListItem(`country_code_3="${team.tla.toLowerCase()}"`);
    // console.log("Existing record: ", record);
    /* do nothing
    const updRecord = await pb.collection('teams').update(record.id, data);
    pb_status.push({ type: "team", code: updRecord.country_code_3, status: 'updated', date: updRecord.updated });
    */
    // console.log("Updated record: ", updRecord);
  } catch (err: any) {
    // team doest not exists, try to create
    // console.dir(err);
    if (!(err.status && err.status == "404")) return new Response('<div class="font-mono text-xs">'+JSON.stringify(err)+'</div>', { headers: headers });
    record = await pb.collection('teams').create(data);
    pb_status.push({ type: "team", code: record.country_code_3, status: 'created', date: record.created });
    // console.log("New record:", newRecord);
  }
  return record;
}

export async function GET({ request, cookies }: APIContext) {

  // clear pb_status;
  pb_status = [];
  // set default header
  headers = { "Content-Type": "html/text" };
    // const query_params = new URL(request.url).searchParams;
  // console.log("Request params:", query_params);

  // authenticate with token first
  pb.authStore.loadFromCookie(request.headers.get('cookie') || '');
  if (!pb.authStore.isValid) {
    const response = '<p>Unauthorized</p>';
    return new Response(response, { status: 401, headers });
  }

    // read token cookie
  const auth_token = cookies.get('fd_token')?.value || '';

  let json_data: any = null;
  try {
    const api_response = await fetch(`http://api.football-data.org/v4/competitions/2018/matches/?status=SCHEDULED`, {
      headers: {
        'X-Auth-Token': auth_token
      }
    });
    if (api_response.ok) {
      json_data = await api_response.json()
    }
  } catch (err) {
    // console.dir(err);
    return new Response('<div class="font-mono text-xs">'+JSON.stringify(err)+'</div>', { status: 500 });
  }

  if (json_data) {
    const matches: any[] = json_data.matches;
    const competitionData: Competition = json_data.competition;
    var competition: any = null;
    try {
      // check if competition exists
      competition = await pb.collection('competitions').getFirstListItem(`fd_id="${competitionData.id}"`);
      // console.log("Existing competition:", competition);
    } catch (err: any) {
      // competition does not exist, try to create
      //console.dir(err);
      if (!(err.status && err.status == "404")) return new Response('<div class="font-mono text-xs">'+JSON.stringify(err)+'</div>', { headers: headers });
      const data = new FormData();
        data.set('name', competitionData.name);
        data.set('code', competitionData.code);
        data.set('type', competitionData.type);
        data.set('emblem', competitionData.emblem.split('/').pop() || '');
        data.set('fd_id', competitionData.id.toString());
      // console.log("competition data:", data);
      competition = await pb.collection('competitions').create(data);
      pb_status.push({ type: "competition", fd_id: competition.fd_id, status: 'created', date: competition.created });
      // console.log("New competition:", competition);
    }
    let i = 0;
    for(const match of matches) {
      i++;
      const home_tla = match.homeTeam.tla;
      const away_tla = match.awayTeam.tla;
      const home_record = home_tla ? await check_team(match.homeTeam) : { id: null };
      const away_record = away_tla ? await check_team(match.awayTeam) : { id: null };
      const utc_date = new Date(Date.parse(match.utcDate));
      const game_name = home_tla ? home_tla.toUpperCase() + ' v ' + away_tla.toUpperCase() : '';
      // create data
      const matchData = new FormData();
        matchData.set('num', i.toString());
        matchData.set('name', game_name)
        matchData.set('date', utc_date.toISOString());
        matchData.set('status', match.status);
        matchData.set('stage', match.stage);
        matchData.set('group', match.group || '');
        matchData.set('duration', match.score.duration);
        matchData.set('team_1', home_record.id?.toString() || '');
        matchData.set('team_2', away_record.id?.toString() || '');
        matchData.set('competition', competition.id);
        matchData.set('fd_id', match.id.toString());
      // clear group if null
      if (!match.group) {
        matchData.delete('group');
      }
      // clear teams if null
      if (!home_tla) {
        matchData.delete('name');
        matchData.delete('team_1');
        matchData.delete('team_2');
      }
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
        // match does not exist, try to create
        // console.dir(err);
        if (!(err.status && err.status == "404")) return new Response('<div class="font-mono text-xs">'+JSON.stringify(err)+'</div>', { headers: headers });
        const newRecord = await pb.collection('games').create(matchData);
        pb_status.push({ type: "game", fd_id: newRecord.fd_id, status: 'created', date: newRecord.created });
        // console.log("New record:", newRecord);
      }
    }
  }

  const body = '<p class="mb-3 text-xl">Matches updated</p><div class="font-mono text-xs">'+JSON.stringify(pb_status)+'</div>'; // body must be a string

  return new Response(body, { headers: headers });

};