import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
} from "@mui/material";
import api from "../api/axios";

const categories = ["delivery", "quality", "service", "technical", "billing"];
const statuses = ["pending", "resolved", "in_progress"];

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
      setSelectedCategory(response.data.category);
      setSelectedStatus(response.data.status);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch complaint details"
      );
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError("");

    try {
      const response = await api.put(`/complaints/${id}`, {
        category: selectedCategory,
        status: selectedStatus,
        feedback:
          selectedCategory !== complaint.category
            ? selectedCategory
            : undefined,
      });
      setComplaint(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!complaint) {
    return (
      <Container maxWidth="md">
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
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Complaint Details
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {complaint.text}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Chip
                  label={`Confidence: ${(complaint.confidence * 100).toFixed(
                    1
                  )}%`}
                  color={complaint.confidence >= 0.8 ? "success" : "warning"}
                />
                <Chip
                  label={`Submitted: ${new Date(
                    complaint.timestamp
                  ).toLocaleString()}`}
                  color="default"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/complaints")}
                >
                  Back to List
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ComplaintDetail;
