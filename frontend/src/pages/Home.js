import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

export const Home = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const features = [
    {
      title: "Dashboard",
      description: "View complaint statistics and analytics",
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      path: "/dashboard",
    },
    {
      title: "Complaints",
      description: "Manage and track customer complaints",
      icon: <ListIcon sx={{ fontSize: 40 }} />,
      path: "/complaints",
    },
  ];

  if (isAdmin()) {
    features.push({
      title: "Admin Panel",
      description: "Manage system settings and users",
      icon: <AdminIcon sx={{ fontSize: 40 }} />,
      path: "/admin",
    });
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Welcome to ACCS
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          align="center"
          color="text.secondary"
        >
          Advanced Complaint Classification System
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  align="center"
                >
                  {feature.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(feature.path)}
                >
                  Go to {feature.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
