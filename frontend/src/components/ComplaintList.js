import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  Chip,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const ComplaintList = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch complaints with pagination
  const fetchComplaints = useCallback(async () => {
    try {
      const response = await api.get(
        `/complaints?page=${page + 1}&per_page=${rowsPerPage}`
      );
      setComplaints(response.data.complaints);
      setTotal(response.data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints");
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Delete complaint logic
  const handleDelete = async () => {
    try {
      await api.delete(`/complaints/${deleteId}`);
      setConfirmOpen(false);
      setDeleteId(null);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete complaint");
    }
  };

  // Helper to get confidence badge color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.5) return "warning";
    return "error";
  };

  // Truncate long text for display
  const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        {/* DEBUG: Show current user and admin status */}
        <Typography variant="body2" color="secondary" sx={{ mb: 1 }}>
          Debug: Current user role: {user?.role || "unknown"}
        </Typography>

        <Typography variant="h4" component="h1" gutterBottom>
          Complaints
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Text</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.map((complaint) => {
                const adminStatus = isAdmin();
                console.log("isAdmin:", adminStatus); // DEBUG log

                return (
                  <TableRow key={complaint._id}>
                    <TableCell>{truncateText(complaint.text)}</TableCell>
                    <TableCell>
                      <Chip label={complaint.category} color="primary" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${(complaint.confidence * 100).toFixed(1)}%`}
                        color={getConfidenceColor(complaint.confidence)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={complaint.status}
                        color={
                          complaint.status === "pending"
                            ? "warning"
                            : "success"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(complaint.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() =>
                          navigate(`/complaints/${complaint._id}`)
                        }
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {adminStatus && (
                        <IconButton
                          onClick={() => {
                            setDeleteId(complaint._id);
                            setConfirmOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Delete Complaint</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this complaint? This action
              cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ComplaintList;
