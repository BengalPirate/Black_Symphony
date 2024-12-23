import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import TiledMap from './TiledMap';
import { API, graphqlOperation } from 'aws-amplify';
import { onGameStateUpdated } from './graphql/subscriptions';

const GamePlayScreen = () => {
    const [gameState, setGameState] = useState({ playerPositions: [] });

    // Subscription to listen for real-time updates
    useEffect(() => {
        const subscription = API.graphql(graphqlOperation(onGameStateUpdated, { playerId: "player1" }))
            .subscribe({
                next: ({ value }) => {
                    console.log("Real-time update received:", value.data.onGameStateUpdated);
                    setGameState(value.data.onGameStateUpdated); // Update state with new game data
                },
                error: (error) => console.error("Subscription error:", error),
            });

        // Cleanup the subscription on unmount
        return () => subscription.unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            {/* Pass the updated game state to the TiledMap */}
            <TiledMap
                mapWidth={20}
                mapHeight={15}
                tileSize={32}
                mapImage={require('./assets/map_full.png')}
            />
            {/* Render additional elements like player positions based on gameState */}
            {gameState.playerPositions.map((player, index) => (
                <View
                    key={index}
                    style={{
                        position: 'absolute',
                        top: player.y * 32, // Adjust based on tileSize
                        left: player.x * 32,
                        width: 32,
                        height: 32,
                        backgroundColor: 'blue', // Placeholder for the player sprite
                    }}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});

export default GamePlayScreen;
