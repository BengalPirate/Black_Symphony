import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { getGameState } from './graphql/queries';

const GameScreen = () => {
    const [gameState, setGameState] = useState(null);

    const fetchGameState = async (playerId) => {
        try {
            const result = await API.graphql(graphqlOperation(getGameState, { playerId }));
            setGameState(result.data.getGameState); // Update state with fetched data
        } catch (error) {
            console.error('Error fetching game state:', error);
        }
    };

    // Fetch game state when the component mounts
    useEffect(() => {
        fetchGameState('player1');
    }, []);

    if (!gameState) {
        return <Text>Loading...</Text>; // Show a loading state until data is fetched
    }

    return (
        <View>
            <Text>Player ID: {gameState.playerId}</Text>
            <Text>Position: {gameState.position}</Text>
            <Text>Score: {gameState.score}</Text>
        </View>
    );
};

export default GameScreen;
