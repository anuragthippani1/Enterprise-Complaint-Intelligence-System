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
  Chip,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  AdminPanelSettings as AdminIcon,
  SmartToy as AIIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  Psychology as BrainIcon,
  SentimentSatisfied as SentimentIcon,
  Flag as PriorityIcon,
  Loop as FeedbackIcon,
  AutoAwesome as MagicIcon,
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
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 10,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "white",
                color: "#667eea",
                margin: "0 auto 20px",
              }}
            >
              <AIIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Welcome to ACCS
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.95 }}>
              Automated Complaint Classification System
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Powered by Machine Learning • Sentiment Analysis • Priority Management
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Chip
                icon={<MagicIcon />}
                label="AI-Powered"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
              <Chip
                icon={<SpeedIcon />}
                label="Real-time"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
              <Chip
                icon={<TrendingIcon />}
                label="Self-Improving"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/complaints")}
                sx={{
                  bgcolor: "white",
                  color: "#667eea",
                  "&:hover": { bgcolor: "#f5f5f5" },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/dashboard")}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                View Dashboard
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

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
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
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
                    fontWeight="bold"
                  >
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(feature.path)}
                    sx={{ bgcolor: feature.color }}
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
      <Box sx={{ bgcolor: "#f5f5f5", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            align="center"
            sx={{ mb: 1, fontWeight: "bold" }}
          >
            🤖 Powered by Artificial Intelligence
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Advanced features that make complaint management intelligent and efficient
          </Typography>

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
                bgcolor: "#e3f2fd",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                  bgcolor: "#bbdefb",
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
                bgcolor: "#fce4ec",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                  bgcolor: "#f8bbd0",
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
                bgcolor: "#f3e5f5",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                  bgcolor: "#e1bee7",
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
