// testFetch.js
import Amplify from 'aws-amplify';
import awsExports from '../../aws-exports'; // Adjust the path if needed
import { API, graphqlOperation } from 'aws-amplify';
import { getGameState } from './graphql/queries'; // Adjust the path if needed

Amplify.configure(awsExports);


const fetchGameState = async (playerId) => {
  try {
    const variables = { playerId };
    const response = await API.graphql(graphqlOperation(getGameState, variables));
    console.log('Game State:', response.data.getGameState);
  } catch (error) {
    console.error('Error fetching game state:', error);
  }
};

fetchGameState('room1');
