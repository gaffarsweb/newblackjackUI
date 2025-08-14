import React, { useState, useEffect } from "react";

import io from "socket.io-client";
import {
  TABLE_UPDATED,
  CARD_RECEIVED,
  GAME_START,
  END_HAND,
  STAY,
  FETCH_LOBBY_INFO,
  RECEIVE_LOBBY_INFO,
  DISCONNECT,
  PLAYERS_UPDATED,
  SIT_DOWN,
  DOUBLE,
  HIT,
} from "./actions";

const WebSocketProvider = ({ children }) => {
  // const user = {
  //   id:generateUUID(),
  //   username: 'testuser_' + Date.now(),
  //   bankroll: 30000,
  // };

  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [tableId,setTableId] = useState(0)

  useEffect(() => {
    window.addEventListener("beforeunload", cleanUp);
    window.addEventListener("beforeclose", cleanUp);
    return () => cleanUp();
    // eslint-disable-next-line
  }, []);

  const betAndStartGame = () => {
    console.log("calling to socket event sit down --------------");
    if (!socket) return;

    socket.emit(SIT_DOWN, { amount: 2 });
  };


   const stay = () => {
    console.log("calling to socket event stay --------------",tableId);
    if (!socket) return;

    socket.emit(STAY,tableId );
  };
    const hit = () => {
    console.log("calling to socket event hit --------------",tableId);
    if (!socket) return;

    socket.emit(HIT,tableId );
  };

    const double = () => {
    console.log("calling to socket event double --------------",tableId);
    if (!socket) return;

    socket.emit(DOUBLE,tableId );
  };

  useEffect(() => {
    // if (isLoggedIn) {
    //   const token = localStorage.token;
    const webSocket = socket || connect();

    webSocket && webSocket.emit(FETCH_LOBBY_INFO, "testuser");
    console.log("before call to fetch lobby---", webSocket);

    console.log("after call");

    return () => cleanUp();
    // eslint-disable-next-line
  }, []);

  function cleanUp() {
    window.socket && window.socket.emit(DISCONNECT);
    window.socket && window.socket.close();
    setSocket(null);
    setSocketId(null);
    // setPlayers(null);
    // setTables(null);
  }

  function connect() {
    try {
      const socket =
        //this is game port
        io("http://localhost:4000", {
          //This is chat port

          //io("http://pokerchat.onsdlc.cloud", {

          // path: "/socket.io", // Ensure the correct path is used
          transports: ["websocket"], // WebSocket only
          upgrade: false, // If your server only supports WebSocket
          query: {
            playerId: "e39f65ee-5369-42e1-98af-6dda6202f13b",
          },
          reconnection: true, // Enable automatic reconnection
          reconnectionDelay: 5000, // Retry connection after 5 seconds
          reconnectionDelayMax: 5000, // Maximum delay between retries
          timeout: 20000, // Timeout for initial connection
        });

      console.log("socket-----", socket);
      registerCallbacks(socket);
      setSocket(socket);
      window.socket = socket;
      return socket;
    } catch (e) {
      console.log("while socket connection error--------", e);
    }
  }

  function registerCallbacks(socket) {
    socket.on("connect", () => {
      console.log("Successfully connected to the Socket.IO server");
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.log("Connection Error:", err);
    });

    // Exam

    socket.on("connection", (players) => {
      console.log(PLAYERS_UPDATED, players);
      //setPlayers(players);
      console.log("connections----");
      // enroll user
      socket.emit(FETCH_LOBBY_INFO, "mayuri");
    });

    //enroll user
    //socket.emit(FETCH_LOBBY_INFO, "mayuri");
    socket.on(RECEIVE_LOBBY_INFO, ({ tables, players, socketId }) => {
      console.log("received lobby info------", tables, players, socketId);
      console.log(RECEIVE_LOBBY_INFO, tables, players, socketId);
      setSocketId(socketId);
      //  setTables(tables);
      // setPlayers(players);
    });

    socket.on(PLAYERS_UPDATED, (players) => {
      console.log("call to players updated----", players);
      console.log(PLAYERS_UPDATED, players);
    });

    socket.on(TABLE_UPDATED, (data) => {
      console.log(TABLE_UPDATED, data);
    });

    socket.on(GAME_START, (data) => {
      console.log(GAME_START, data);
      setTableId(data?.table?.id)
    });
    socket.on(CARD_RECEIVED, (data) => {
      console.log(CARD_RECEIVED, data);
    });

    socket.on(STAY, (data) => {
      console.log(STAY, data);
    });

    socket.on(END_HAND, (data) => {
      console.log(END_HAND, data);
    });

  
  }

  return (
    <div>
      <p>Test </p>

      <p
        onClick={() => {
          betAndStartGame();
        }}
        style={{ cursor: "pointer", color: "blue" }}
      >
        BET and start game
      </p>


       <p
        onClick={() => {
          stay();
        }}
        style={{ cursor: "pointer", color: "blue" }}
      >
        STAY
      </p>

        <p
        onClick={() => {
          hit();
        }}
        style={{ cursor: "pointer", color: "blue" }}
      >
        HIT
      </p>


       <p
        onClick={() => {
          double();
        }}
        style={{ cursor: "pointer", color: "blue" }}
      >
        DOUBLE
      </p>
    </div>
  );
};

export default WebSocketProvider;
