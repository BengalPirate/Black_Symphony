// subscriptions.js
export const onGameStateUpdated = `
  subscription OnGameStateUpdated($playerId: ID!) {
    onGameStateUpdated(playerId: $playerId) {
      playerId
      position
      score
    }
  }
`;