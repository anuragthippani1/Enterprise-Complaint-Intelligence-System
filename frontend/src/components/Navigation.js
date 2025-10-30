import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "../contexts/AuthContext";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate("/login");
  };

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "rgba(11,16,32,0.6)",
        backdropFilter: "saturate(140%) blur(6px)",
        color: "#ffffff",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            cursor: "pointer",
            mr: 3,
            fontFamily: 'Panchang, sans-serif',
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
          onClick={() => navigate("/")}
        >
          ACCS
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <Button onClick={() => navigate("/")} sx={{ mr: 2, color: "#ffffff" }}>
            Home
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 2, color: "#ffffff" }}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => navigate("/complaints")}
            sx={{ mr: 2, color: "#ffffff" }}
          >
            Complaints
          </Button>
          {user && isAdmin() && (
            <Button
              onClick={() => navigate("/admin")}
              sx={{ mr: 2, color: "#ffffff" }}
            >
              Admin Panel
            </Button>
          )}
          {user ? (
            <>
              <IconButton size="large" onClick={handleMenu} sx={{ color: "#ffffff" }}>
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  {user.username} ({user.role})
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
