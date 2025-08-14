// src/App.js
import React, { useEffect } from 'react';
import BlackjackGame from './components/BlackjackGame';
import Header from './components/Header';
import BetDashboard from './components/BetDashboard';
import socket from './socket';
import './index.css';
import WebSocketProvider from './socket/WebSocketProvide';
import { useMediaQuery, useTheme } from '@mui/material';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App = () => {
    const theme = useTheme();
    const isAbove899px = useMediaQuery(theme.breakpoints.up('sm')); // This checks if the width is above 899px
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="app">
      <Header /> <ToastContainer />

      {/* <WebSocketProvider/> */}
      <BlackjackGame socket={socket} />
        {isAbove899px && <BetDashboard socket={socket} />}  {/* Render BetDashboard only if width is above 899px */}
    </div>
  );
};

export default App;
