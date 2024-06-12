/* eslint-disable no-undef */
onModelAfterUpdate((e) => {
  if (e.model.get('played')) {
    const gameId = e.model.get('id')
    const home = e.model.get('team_1_score')
    const away = e.model.get('team_2_score')

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
        .newQuery('UPDATE users SET points = (SELECT SUM(points) FROM bets WHERE user = users.id GROUP BY user)')
        .execute()
    } catch (e) {
      console.error(e)
    }
  }
}, 'games')