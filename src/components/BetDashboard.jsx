import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import betData from "../backend/data";

const BetDashboard = () => {
  const [ghostMode, setGhostMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [rows, setRows] = useState(10);

  const tabs = ["My Bets", "All Bets", "High Rollers", "Race Leaderboard"];

  const renderTableHead = () => {
    switch (selectedTab) {
      case 0:
        return ["Game", "Time", "Bet Amount", "Multiplier", "Payout"];
      case 1:
      case 2:
        return ["Game", "User", "Time", "Bet Amount", "Multiplier", "Payout"];
      case 3:
        return ["Rank", "User", "Wagered", "Payout"];
      default:
        return [];
    }
  };

  const renderTableRows = () => {
    const sliced = betData.slice(0, rows);

    if (selectedTab === 0) {
      return sliced.map((row, index) => (
        <TableRow key={index} hover sx={{ "&:hover": { bgcolor: "#2a2a2a" } }}>
          <TableCell sx={{ color: "white" }}>{row.game}</TableCell>
          <TableCell sx={{ color: "white" }}>{row.time}</TableCell>
          <TableCell sx={{ color: "#4fc3f7" }}>
            {row.bet} <span style={{ fontSize: "10px", color: "#aaa" }}>⚪️</span>
          </TableCell>
          <TableCell sx={{ color: "white" }}>{row.multiplier}</TableCell>
          <TableCell sx={{ color: "#ef5350" }}>
            {row.payout} <span style={{ fontSize: "10px", color: "#aaa" }}>⚪️</span>
          </TableCell>
        </TableRow>
      ));
    }

    if (selectedTab === 1 || selectedTab === 2) {
      return sliced.map((row, index) => (
        <TableRow key={index} hover sx={{ "&:hover": { bgcolor: "#2a2a2a" } }}>
          <TableCell sx={{ color: "white" }}>{row.game}</TableCell>
          <TableCell sx={{ color: "#00e676" }}>{row.user}</TableCell>
          <TableCell sx={{ color: "white" }}>{row.time}</TableCell>
          <TableCell sx={{ color: "#4fc3f7" }}>
            {row.bet} <span style={{ fontSize: "10px", color: "#aaa" }}>⚪️</span>
          </TableCell>
          <TableCell sx={{ color: "white" }}>{row.multiplier}</TableCell>
          <TableCell sx={{ color: "#ef5350" }}>
            {row.payout} <span style={{ fontSize: "10px", color: "#aaa" }}>⚪️</span>
          </TableCell>
        </TableRow>
      ));
    }

    if (selectedTab === 3) {
      return sliced.map((row, index) => (
        <TableRow key={index} hover sx={{ "&:hover": { bgcolor: "#2a2a2a" } }}>
          <TableCell sx={{ color: "#00e676" }}>{index + 1}</TableCell>
          <TableCell sx={{ color: "#4fc3f7" }}>{row.user}</TableCell>
          <TableCell sx={{ color: "white" }}>
            {row.bet} <span style={{ fontSize: "10px", color: "#aaa" }}>⚪️</span>
          </TableCell>
          <TableCell sx={{ color: "#ef5350" }}>
            {row.payout} <span style={{ fontSize: "10px", color: "#aaa" }}>⚪️</span>
          </TableCell>
        </TableRow>
      ));
    }
  };

  return (
    <Box sx={{ bgcolor: "#0f0f0f", minHeight: "100vh", p: 3, color: "white" }}>
      <AppBar position="static" sx={{ bgcolor: "#1c1c1c", mb: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">
            Blackjack <span style={{ color: "#bbb" }}>Money Tree Original</span>
          </Typography>

          <Box display="flex" alignItems="center" gap={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="gray">
                Ghost Mode {ghostMode ? "On" : "Off"}
              </Typography>
              <Switch
                checked={ghostMode}
                onChange={() => setGhostMode(!ghostMode)}
                color="success"
                size="small"
              />
            </Box>

            <Select
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              size="small"
              variant="outlined"
              sx={{
                bgcolor: "#2c2c2c",
                color: "white",
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                ".MuiSvgIcon-root": { color: "white" },
              }}
            >
              {[10, 25, 50].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Toolbar>
      </AppBar>

      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        textColor="inherit"
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          ".MuiTab-root": { color: "#bbb", textTransform: "none" },
          ".Mui-selected": { color: "#00e676" },
        }}
      >

        {tabs.map((tab) => (
          <Tab
            key={tab}
            label={
              tab === "Race Leaderboard" ? (
                <Box display="flex" alignItems="center" gap={0.5}>
                  {tab}
                  <span style={{ color: "#00e676" }}>●</span>
                </Box>
              ) : (
                tab
              )
            }
          />
        ))}
      </Tabs>

      {selectedTab === 3 && (
        <Box display="flex" justifyContent="space-between" mt={3} mb={1} px={1}>
          <Typography variant="subtitle1" color="white">
            $100k Race
          </Typography>
          <Box display="flex" gap={3}>
            <Typography variant="body2" color="gray">
              Start in 5 hours
            </Typography>
            <Typography variant="body2" color="gray">
              Ends in 2 hours
            </Typography>
          </Box>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: "#1e1e1e", mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              {renderTableHead().map((heading) => (
                <TableCell key={heading} sx={{ color: "#bbb" }}>
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BetDashboard;
