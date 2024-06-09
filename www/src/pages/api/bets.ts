import { pb } from "@/services/pocketbase";

export const prerender = false;

export async function POST({ request }: any) {
  const headers: any = { "Content-Type": "text/html" };

  const userID = pb.authStore.model?.id

  if (!pb.authStore.isValid || !userID) {
    return new Response('<p>You are not authenticated</p>', { status: 400, headers });
  }

  const formData = await request.formData()
  const formObject: any = {}
  for (const key of formData.keys()) {
    formObject[key] = formData.get(key)
  }

  if (!formObject.gameID) {
    return new Response('<p>Game ID is required</p>', { status: 400, headers });
  }

  if (!formObject.team_1_score_bet) {
    return new Response('<p>Team 1 score bet is required</p>', { status: 400, headers });
  }

  if (!formObject.team_2_score_bet) {
    return new Response('<p>Team 2 score bet is required</p>', { status: 400, headers });
  }

  const data = {
    user: userID,
    game: formObject.gameID,
    team_1_score_bet: formObject.team_1_score_bet,
    team_2_score_bet: formObject.team_2_score_bet
  }

  await pb.collection('bets').create(data);

  return new Response(
    '<p id="bet-create-form" hx-swap-oob="true">Bet created!</p>', {
      status: 200,
      headers
    }
  );
}

export async function PUT({ request }: any) {
  const headers: any = { "Content-Type": "text/html" };

  const userID = pb.authStore.model?.id

  if (!pb.authStore.isValid || !userID) {
    return new Response('<p>You are not authenticated</p>', { status: 400, headers });
  }

  const formData = await request.formData()
  const formObject: any = {}
  for (const key of formData.keys()) {
    formObject[key] = formData.get(key)
  }

  if (!formObject.gameID) {
    return new Response('<p>Game ID is required</p>', { status: 400, headers });
  }

  if (!formObject.team_1_score_bet) {
    return new Response('<p>Team 1 score bet is required</p>', { status: 400, headers });
  }

  if (!formObject.team_2_score_bet) {
    return new Response('<p>Team 2 score bet is required</p>', { status: 400, headers });
  }

  const data = {
    user: userID,
    game: formObject.gameID,
    team_1_score_bet: formObject.team_1_score_bet,
    team_2_score_bet: formObject.team_2_score_bet
  }

  await pb.collection('bets').update(formObject.betID, data);

  return new Response(
    '<p id="bet-update-form" hx-swap-oob="true">Bet updated!</p>', {
      status: 200,
      headers
    }
  );
}

export async function DELETE({ params }: any) {
  const headers: any = { "Content-Type": "text/html" };

  const userID = pb.authStore.model?.id

  if (!pb.authStore.isValid || !userID) {
    return new Response('<p>You are not authenticated</p>', { status: 400, headers });
  }

  await pb.collection('bets').delete(params.betID);

  return new Response(
    '<p id="bet-delete-form" hx-swap-oob="true">Bet deleted!</p>', {
      status: 200,
      headers
    }
  );
}