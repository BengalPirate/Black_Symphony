// index.js
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

/** ----------------------------------------------------------------
 * CREATE ROOM
 *  POST /createRoom → Handler: index.createRoom
 * ----------------------------------------------------------------*/
exports.createRoom = async (event) => {
    const body = JSON.parse(event.body || '{}');
    const { hostId, hostMage } = body;
    const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
  
    const newRoom = {
      roomId,
      hostId,
      playerList: [
        {
          playerId: hostId,
          mageType: hostMage,
          isHost: true,
          isReady: false,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      inProgress: false,
    };
  
    // Write to DynamoDB
    await ddb.put({
      TableName: 'RoomsTable',
      Item: newRoom,
    }).promise();
  
    // Instead of returning just { roomId }, return the entire room:
    return {
      statusCode: 200,
      body: JSON.stringify(newRoom),
    };
  };

/** ----------------------------------------------------------------
 * JOIN ROOM
 *  POST /joinRoom → Handler: index.joinRoom
 * ----------------------------------------------------------------*/
exports.joinRoom = async (event) => {
    const body = JSON.parse(event.body || '{}');
    const { roomId, playerId } = body;
  
    const res = await ddb.get({
      TableName: 'RoomsTable',
      Key: { roomId },
    }).promise();
  
    if (!res.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Room not found' }),
      };
    }
  
    const room = res.Item;
    if (room.playerList.length >= 8) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Room is full' }),
      };
    }
  
    // Add the new player to playerList
    room.playerList.push({
      playerId,
      mageType: null,
      isHost: false,
      isReady: false,
    });
    room.updatedAt = Date.now();
  
    await ddb.put({
      TableName: 'RoomsTable',
      Item: room,
    }).promise();
  
    // Return the entire updated room
    return {
      statusCode: 200,
      body: JSON.stringify(room),
    };
  };

/** ----------------------------------------------------------------
 * POLL ROOM
 *  GET /pollRoom?roomId=XYZ → Handler: index.pollRoom
 * ----------------------------------------------------------------*/
exports.pollRoom = async (event) => {
  const { roomId } = event.queryStringParameters || {};

  if (!roomId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No roomId provided' }),
    };
  }

  const res = await ddb.get({
    TableName: 'RoomsTable',
    Key: { roomId },
  }).promise();

  if (!res.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Room not found' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(res.Item),
  };
};

/** ----------------------------------------------------------------
 * SELECT SPRITE
 *  POST /selectSprite → Handler: index.selectSprite
 * ----------------------------------------------------------------*/
exports.selectSprite = async (event) => {
    const body = JSON.parse(event.body || '{}');
    const { roomId, playerId, mageType } = body;
  
    if (!roomId || !playerId || !mageType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }
  
    const res = await ddb.get({
      TableName: 'RoomsTable',
      Key: { roomId },
    }).promise();
  
    if (!res.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Room not found' }),
      };
    }
  
    const room = res.Item;
    // Ensure sprite isn't taken
    const isTaken = room.playerList.some((p) => p.mageType === mageType);
    if (isTaken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Sprite already taken' }),
      };
    }
  
    // Assign the mage
    for (const p of room.playerList) {
      if (p.playerId === playerId) {
        p.mageType = mageType;
        break;
      }
    }
    room.updatedAt = Date.now();
  
    await ddb.put({
      TableName: 'RoomsTable',
      Item: room,
    }).promise();
  
    // Return the updated room
    return {
      statusCode: 200,
      body: JSON.stringify(room),
    };
  };

/** ----------------------------------------------------------------
 * START GAME
 *  POST /startGame → Handler: index.startGame
 * ----------------------------------------------------------------*/
exports.startGame = async (event) => {
    const body = JSON.parse(event.body || '{}');
    const { roomId } = body;
  
    if (!roomId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing roomId' }),
      };
    }
  
    const res = await ddb.get({
      TableName: 'RoomsTable',
      Key: { roomId },
    }).promise();
  
    if (!res.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Room not found' }),
      };
    }
  
    const room = res.Item;
    // Mark inProgress
    room.inProgress = true;
    room.updatedAt = Date.now();
  
    await ddb.put({
      TableName: 'RoomsTable',
      Item: room,
    }).promise();
  
    return {
      statusCode: 200,
      body: JSON.stringify(room),
    };
  };
