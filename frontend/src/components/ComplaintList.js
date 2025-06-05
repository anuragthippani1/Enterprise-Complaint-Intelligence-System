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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../api/axios";

const ComplaintList = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.5) return "warning";
    return "error";
  };

  const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
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
              {complaints.map((complaint) => (
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
                        complaint.status === "pending" ? "warning" : "success"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(complaint.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => navigate(`/complaints/${complaint._id}`)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
      </Box>
    </Container>
  );
};

export default ComplaintList;
