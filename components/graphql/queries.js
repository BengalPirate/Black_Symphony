export const getGameState = `
  query GetGameState($playerId: ID!) {
    getGameState(playerId: $playerId) {
      playerId
      position
      score
    }
  }
`;