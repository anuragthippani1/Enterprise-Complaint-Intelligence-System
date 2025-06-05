import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await fetch(`/api/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch complaint");
        const data = await response.json();
        setComplaint(data);
        setCategory(data.category);
        setStatus(data.status);
      } catch (error) {
        setError("Error fetching complaint details");
        console.error("Error:", error);
      }
    };

    fetchComplaint();
  }, [id, user.token]);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          category,
          status,
        }),
      });

      if (!response.ok) throw new Error("Failed to update complaint");

      setSuccess("Complaint updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Error updating complaint");
      console.error("Error:", error);
    }
  };

  if (!complaint) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Complaint Details
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Text:</strong> {complaint.text}
          </Typography>

          <Typography variant="body2" color="textSecondary">
            <strong>Submitted By:</strong> {complaint.submitted_by}
          </Typography>

          <Typography variant="body2" color="textSecondary">
            <strong>Timestamp:</strong>{" "}
            {new Date(complaint.timestamp).toLocaleString()}
          </Typography>

          <Typography variant="body2" color="textSecondary" paragraph>
            <strong>ML Confidence:</strong>{" "}
            {(complaint.confidence * 100).toFixed(2)}%
          </Typography>

          {isAdmin() ? (
            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="delivery">Delivery</MenuItem>
                  <MenuItem value="quality">Quality</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                  <MenuItem value="service">Service</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                sx={{ mr: 1 }}
              >
                Update Complaint
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1">
                <strong>Category:</strong> {category}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {status}
              </Typography>
            </Box>
          )}

          <Button
            variant="outlined"
            onClick={() => navigate("/complaints")}
            sx={{ mt: 2 }}
          >
            Back to List
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
