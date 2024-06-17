onModelAfterUpdate((e) => {
  if (e.model.get('status') === 'FINISHED') {
    const gameId = e.model.get('id')
    const home = e.model.get('team_1_score')
    const away = e.model.get('team_2_score')
    const teamIds = [e.model.get('team_1'),e.model.get('team_2')];

    // update game team_points
    try {
      $app.dao().db()
        .newQuery("UPDATE games SET team_1_points = CASE WHEN team_1_score > team_2_score THEN 3 WHEN team_1_score = team_2_score THEN 1 ELSE 0 END, team_2_points = CASE WHEN team_1_score < team_2_score THEN 3 WHEN team_1_score = team_2_score THEN 1 ELSE 0 END WHERE id = {:gameId}")
        .bind({
          "gameId": gameId
        })
        .execute()
    } catch (e) {
      console.error(e)
    }

    // update team_1 and team_2 stats for group stages only
    for (const teamId of teamIds) {
      const team_games = $app.dao().findRecordsByFilter("games", `status = 'FINISHED' && stage = 'GROUP_STAGE' && (team_1 = "${teamId}" || team_2 = "${teamId}")`);
      const team_stats = { group_points:0, goals:0, against:0, goal_diff:0, played:0 };
      for (const game of team_games) {
        team_stats.played++;
        if (game.get("team_1") == teamId) {
          team_stats.group_points += game.get("team_1_points");
          team_stats.goals += game.get("team_1_score");
          team_stats.against += game.get("team_2_score");
        } else if (game.get("team_2") == teamId) {
          team_stats.group_points += game.get("team_2_points");
          team_stats.goals += game.get("team_2_score");
          team_stats.against += game.get("team_1_score");
        }
      }
      team_stats.goal_diff += team_stats.goals - team_stats.against;
      // console.log(teamId, team_stats.played, team_stats.group_points, team_stats.goals, team_stats.against, team_stats.goal_diff);
      const team = $app.dao().findRecordById("teams", teamId);
      const form = new RecordUpsertForm($app, team);
      form.loadData(team_stats);
      form.submit()
    }

    // Update bets
    const bets = $app.dao().findRecordsByFilter('bets', `game = "${gameId}"`)

    for (const bet of bets) {
      const form = new RecordUpsertForm($app, bet)

      let points = 0

      if (bet.get('team_1_score_bet') === home && bet.get('team_2_score_bet') === away) {
        points = 4 // Exact score
      } else if (bet.get('team_1_score_bet') - bet.get('team_2_score_bet') === home - away) {
        points = 3 // Exact goal difference or draw
      } else if (bet.get('team_1_score_bet') > bet.get('team_2_score_bet') && home > away) {
        points = 2 // Correct winner
      } else if (bet.get('team_1_score_bet') < bet.get('team_2_score_bet') && home < away) {
        points = 2 // Correct winner
      }

      form.loadData({
        points
      })

      form.submit()
    }

    // Update points at users
    try {
      $app.dao().db()
        .newQuery('UPDATE users SET points = COALESCE((SELECT SUM(points) FROM bets WHERE user = users.id GROUP BY user), 0)')
        .execute()
    } catch (e) {
      console.error(e)
    }
  }
}, 'games')