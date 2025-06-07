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
  Alert,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import api from "../api/axios";
import ListIcon from "@mui/icons-material/List";

const categories = ["billing", "delivery", "quality", "service", "technical"];
const statuses = ["pending", "in_progress", "resolved", "closed"];

export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isNew = id === "new";

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/complaints/${id}`);
      const data = response.data;

      // Check if user has access to this complaint
      if (!isAdmin() && data.user !== user.username) {
        setError("You don't have access to this complaint");
        toast.error("You don't have access to this complaint");
        navigate("/complaints");
        return;
      }

      setComplaint(data);
      setCategory(data.category || "");
      setStatus(data.status || "");
      setText(data.text || "");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching complaint details";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!text.trim()) {
      toast.error("Please enter complaint text");
      return;
    }

    try {
      await api.post("/complaints", { text });
      toast.success("Complaint created successfully");
      navigate("/complaints");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating complaint";
      toast.error(errorMessage);
      console.error("Error:", error);
    }
  };

  const handleUpdate = async () => {
    if (!category || !status) {
      toast.error("Please select both category and status");
      return;
    }

    try {
      await api.put(`/complaints/${id}`, { category, status });
      toast.success("Complaint updated successfully");
      fetchComplaint(); // Refresh the complaint data
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating complaint";
      toast.error(errorMessage);
      console.error("Error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/complaints/${id}`);
      toast.success("Complaint deleted successfully");
      navigate("/complaints");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting complaint";
      toast.error(errorMessage);
      console.error("Error:", error);
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

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          {isNew ? "New Complaint" : "Complaint Details"}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/complaints")}
          startIcon={<ListIcon />}
        >
          Back to List
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {isNew ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Complaint Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              margin="normal"
            />
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
              {complaint?.text}
            </Typography>
          )}

          {!isNew && (
            <>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Submitted by: {complaint?.user}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Created: {new Date(complaint?.created_at).toLocaleString()}
              </Typography>
              {complaint?.updated_at && (
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Last updated:{" "}
                  {new Date(complaint.updated_at).toLocaleString()}
                </Typography>
              )}
            </>
          )}

          {isAdmin() && !isNew && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statuses.map((stat) => (
                    <MenuItem key={stat} value={stat}>
                      {stat
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </MenuItem>
                  ))}
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

          {isNew && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              sx={{ mt: 2 }}
            >
              Submit Complaint
            </Button>
          )}
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
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
