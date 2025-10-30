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
  Paper,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  AdminPanelSettings as AdminIcon,
  SmartToy as AIIcon,
  Psychology as BrainIcon,
  SentimentSatisfied as SentimentIcon,
  Flag as PriorityIcon,
  Loop as FeedbackIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

export const Home = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const mainFeatures = [
    {
      title: "Dashboard",
      description: "View complaint statistics and analytics",
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      path: "/dashboard",
      color: "#2196f3",
    },
    {
      title: "Complaints",
      description: "Manage and track customer complaints",
      icon: <ListIcon sx={{ fontSize: 40 }} />,
      path: "/complaints",
      color: "#ff9800",
    },
  ];

  if (isAdmin()) {
    mainFeatures.push({
      title: "Admin Panel",
      description: "Manage system settings and users",
      icon: <AdminIcon sx={{ fontSize: 40 }} />,
      path: "/admin",
      color: "#f44336",
    });
  }

  const aiFeatures = [
    {
      icon: <BrainIcon />,
      title: "ML Classification",
      description: "Automatic complaint categorization",
    },
    {
      icon: <SentimentIcon />,
      title: "Sentiment Analysis",
      description: "Detects emotions (😡😐😊)",
    },
    {
      icon: <PriorityIcon />,
      title: "Smart Priorities",
      description: "Auto-assigns urgency levels",
    },
    {
      icon: <FeedbackIcon />,
      title: "Self-Improving",
      description: "Learns from feedback",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#F2F3ED" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #C7CDAD 0%, #D1D3C4 50%, #D8DAD0 100%)",
          color: "white",
          minHeight: { xs: "calc(100svh - 56px)", md: "calc(100vh - 64px)" },
          py: { xs: 6, md: 8 },
          px: 2,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: "center",
              maxWidth: 900,
              mx: "auto",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              px: { xs: 3, md: 6 },
              py: { xs: 5, md: 7 },
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 400,
                mb: 2,
                letterSpacing: -0.5,
                fontFamily: 'Tanker, sans-serif',
              }}
            >
              Welcome to ACCS
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                opacity: 0.95,
                fontFamily: 'Panchang, sans-serif',
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              Automated Complaint Classification System
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 2, opacity: 0.95, lineHeight: 1.5 }}
            >
              Effortlessly manage and resolve customer complaints with the power of Artificial Intelligence.
            </Typography>
            <Typography variant="body1" sx={{ mb: 5, opacity: 0.9, lineHeight: 1.7 }}>
              Our system automatically analyzes, classifies, and organizes complaints to help organizations respond faster and smarter.
            </Typography>
            {/* Removed feature chips and powered tagline as requested */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/complaints")}
                sx={{
                  background: "linear-gradient(135deg, #C7CDAD, #D1D3C4)",
                  color: "#1f2937",
                  border: "1px solid rgba(31,41,55,0.15)",
                  "&:hover": { filter: "brightness(0.98)" },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/dashboard")}
                sx={{
                  borderColor: "rgba(255,255,255,0.6)",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.12)",
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              >
                View Dashboard
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
      {/* Section Separator */}
      <Box sx={{ height: 20, background: "linear-gradient(180deg, #D8DAD0, #F2F3ED)" }} />

      {/* Main Features Section */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          align="center"
          sx={{ mb: 4, fontWeight: "bold" }}
        >
          Quick Access
        </Typography>
        <Grid container spacing={4}>
          {mainFeatures.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                  background:
                    "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #7e57c2, #26c6da) border-box",
                  border: "2px solid transparent",
                  boxShadow: "0 10px 30px rgba(24, 20, 54, 0.1)",
                  transition: "transform .25s ease, box-shadow .25s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 14px 40px rgba(24, 20, 54, 0.15)",
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center", pt: 5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 2,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    fontWeight={800}
                  >
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ px: 2 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(feature.path)}
                    sx={{
                      bgcolor: feature.color,
                      fontWeight: 700,
                      borderRadius: 999,
                      px: 3,
                    }}
                  >
                    Open {feature.title}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* AI Features Section */}
      <Box sx={{ bgcolor: "#D8DAD0", py: 8 }}>
        <Container maxWidth="lg">
          {/* Removed AI section heading and subtitle as requested */}

          <Grid container spacing={3}>
            {aiFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    height: "100%",
                    bgcolor: "white",
                    border: "2px solid #e0e0e0",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#667eea",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: "#667eea",
                      margin: "0 auto 16px",
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Categories */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={2}
              onClick={() => navigate("/complaints?view=categories")}
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "#C7CDAD",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                  bgcolor: "#b5be9e",
                },
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="#1976d2">
                5
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Delivery • Quality • Billing • Technical • Service
              </Typography>
            </Paper>
          </Grid>

          {/* Sentiments */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={2}
              onClick={() => navigate("/complaints?view=sentiments")}
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "#D1D3C4",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                  bgcolor: "#c6c8b9",
                },
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="#c2185b">
                3
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Sentiments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Negative 😡 • Neutral 😐 • Positive 😊
              </Typography>
            </Paper>
          </Grid>

          {/* Priority Levels */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={2}
              onClick={() => navigate("/complaints?view=priorities")}
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "#D8DAD0",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                  bgcolor: "#cfd1c8",
                },
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="#7b1fa2">
                4
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Priority Levels
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Critical • High • Medium • Low
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer CTA */}
      <Box sx={{ bgcolor: "#667eea", color: "white", py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            Ready to manage complaints intelligently?
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 3, opacity: 0.9 }}>
            Start using ACCS today and experience the power of AI
          </Typography>
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/complaints/new")}
              sx={{
                bgcolor: "white",
                color: "#667eea",
                "&:hover": { bgcolor: "#f5f5f5" },
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              Submit Your First Complaint
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
