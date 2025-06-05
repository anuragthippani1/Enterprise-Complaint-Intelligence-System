import React, { useState, useEffect } from "react";
import { Container, Grid, Paper, Typography, Box, Alert } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import api from "../api/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await api.get("/dashboard/summary");
        setData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch dashboard summary"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const getTimelineChartData = () => {
    if (!data) return null;

    return {
      labels: data.timeline.map((item) => item._id),
      datasets: [
        {
          label: "Complaints",
          data: data.timeline.map((item) => item.count),
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };
  };

  const getCategoryChartData = () => {
    if (!data) return null;

    return {
      labels: data.categories.map((item) => item._id),
      datasets: [
        {
          data: data.categories.map((item) => item.count),
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
          ],
        },
      ],
    };
  };

  const getStatusChartData = () => {
    if (!data) return null;

    return {
      labels: data.statuses.map((item) => item._id),
      datasets: [
        {
          label: "Status Distribution",
          data: data.statuses.map((item) => item.count),
          backgroundColor: [
            "rgba(255, 159, 64, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 205, 86, 0.8)",
          ],
        },
      ],
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Complaints Over Time
              </Typography>
              {getTimelineChartData() && (
                <Line
                  data={getTimelineChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              {getCategoryChartData() && (
                <Pie
                  data={getCategoryChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Status Distribution
              </Typography>
              {getStatusChartData() && (
                <Bar
                  data={getStatusChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
