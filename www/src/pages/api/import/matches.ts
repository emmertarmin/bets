export const prerender = false;

import { pb } from "@/services/pocketbase";
import json_data from "@/data/matches_scheduled.json";
import type { APIContext } from 'astro';

interface Team {
  name: string;
  tla: string;
  crest: string;
  id: number;
}
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

const pb_status: any[] = [];

async function check_team(team: Team) {
  let record: any = team;
  // create data
  const data = new FormData();
    data.set('name', team.name);
    data.set('code', team.tla);
  if (team.crest.length > 0) {
    data.set('crest', team.tla.toLowerCase() + '.' + team.crest.split('.').pop());
  }
  // console.log("team data:", data);
  try {
    // check if team exists
    record = await pb.collection('teams').getFirstListItem(`code="${team.tla}"`);
    // console.log("Existing record: ", record);
    /* do nothing
    const updRecord = await pb.collection('teams').update(record.id, data);
    pb_status.push({ type: "team", code: team.tla, status: 'updated', date: updRecord.updated });
    // console.log("Updated record: ", updRecord);
    */
  } catch (err: any) {
    // team doest not exists, try to create
    // console.dir(err);
    if (!(err.status && err.status == "404")) return new Response(JSON.stringify(err));
    record = await pb.collection('teams').create(data);
    pb_status.push({ type: "team", code: record.tla, status: 'created', date: record.created });
    // console.log("New record:", newRecord);
  }
  return record;
}

export async function GET({ request }: APIContext) {

  const query_params = new URL(request.url).searchParams;
  console.log("Request params:", query_params);
  /*
  // maybe admin authentication is needed
  const adminAuthData = await pb.admins.authWithPassword(
    query_params.user,
    query_params.password
  );
  */

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
    if (!(err.status && err.status == "404")) return new Response(JSON.stringify(err));
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
  for(const match of matches) {
    const home_tla = match.homeTeam.tla;
    const away_tla = match.awayTeam.tla;
    const home_record = home_tla ? await check_team(match.homeTeam) : { id: null };
    const away_record = away_tla ? await check_team(match.awayTeam) : { id: null };
    const utc_date = new Date(Date.parse(match.utcDate));
    // create data
    const matchData = new FormData();
      matchData.set('utc_date', utc_date.toISOString());
      matchData.set('status', match.status);
      matchData.set('stage', match.stage);
      matchData.set('group', match.group || '');
      matchData.set('duration', match.score.duration);
      matchData.set('team_home', home_record instanceof FormData ? home_record.get('id')?.toString() || '' : '');
      matchData.set('team_away', away_record instanceof FormData ? away_record.get('id')?.toString() || '' : '');
      matchData.set('competition', competition.id);
      matchData.set('fd_id', match.id.toString());
    // clear group if null
    if (!match.group) {
      matchData.delete('group');
    }
    // clear teams if null
    if (!home_tla) {
      matchData.delete('team_home');
      matchData.delete('team_away');
    }
    // console.log("match data:", matchData);
    try {
      // check if match exists, then update
      const record = await pb.collection('matches').getFirstListItem(`fd_id="${match.id}"`);
      // console.log("Existing record:", record);
      const updRecord = await pb.collection('matches').update(record.id, matchData);
      pb_status.push({ type: "match", fd_id: updRecord.fd_id, status: 'updated', date: updRecord.updated });
      // console.log("Updated record:", updRecord);
    } catch (err: any) {
      // match does not exist, try to create
      // console.dir(err);
      if (!(err.status && err.status == "404")) return new Response(JSON.stringify(err));
      const newRecord = await pb.collection('matches').create(matchData);
      pb_status.push({ type: "match", fd_id: newRecord.fd_id, status: 'created', date: newRecord.created });
      // console.log("New record:", newRecord);
    }
  }

  const body = JSON.stringify(pb_status); // body must be a string

  return new Response(body);

};