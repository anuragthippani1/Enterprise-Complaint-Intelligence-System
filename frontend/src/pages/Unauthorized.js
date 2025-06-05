import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      textAlign="center"
      padding={3}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph>
        Sorry, you don't have permission to access this page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        sx={{ mt: 2 }}
      >
        Return to Home
      </Button>
    </Box>
  );
};
