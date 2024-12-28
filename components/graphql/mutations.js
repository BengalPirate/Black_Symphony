export const updateGameState = `
  mutation UpdateGameState($playerId: ID!, $position: String!, $score: Int!) {
    updateGameState(playerId: $playerId, position: $position, score: $score) {
      playerId
      position
      score
    }
  }
`;