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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import api from "../api/axios";

export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isNew = id === "new";

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    const fetchComplaint = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch complaint");
        const data = await response.json();

        // Check if user has access to this complaint
        if (!isAdmin() && data.submitted_by !== user.username) {
          toast.error("You don't have access to this complaint");
          navigate("/complaints");
          return;
        }

        setComplaint(data);
        setCategory(data.category);
        setStatus(data.status);
        setText(data.text);
      } catch (error) {
        toast.error("Error fetching complaint details");
        console.error("Error:", error);
        navigate("/complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id, user.token, isNew, user.username, navigate]);

  const handleCreate = async () => {
    try {
      await api.post("/complaints", { text });
      toast.success("Complaint created successfully");
      setTimeout(() => {
        navigate("/complaints");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating complaint");
      console.error("Error:", error);
    }
  };

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

      toast.success("Complaint updated successfully");
      setTimeout(() => {
        navigate("/complaints");
      }, 1500);
    } catch (error) {
      toast.error("Error updating complaint");
      console.error("Error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/complaints/${id}`);
      setDeleteDialogOpen(false);
      toast.success("Complaint deleted successfully");
      navigate("/complaints");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting complaint");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isNew) {
    return (
      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              New Complaint
            </Typography>
            <TextField
              fullWidth
              label="Complaint Text"
              variant="outlined"
              margin="normal"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              multiline
              minRows={3}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              sx={{ mt: 2 }}
              disabled={!text.trim()}
            >
              Submit Complaint
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/complaints")}
              sx={{ mt: 2, ml: 2 }}
            >
              Back to List
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!complaint) {
    return <Typography>Complaint not found</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
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

          {isAdmin() && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="billing">Billing</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                  <MenuItem value="quality">Quality</MenuItem>
                  <MenuItem value="service">Service</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
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

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                  sx={{ mr: 1 }}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </Button>
              </Box>
            </>
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this complaint? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
