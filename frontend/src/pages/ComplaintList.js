import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Alert,
  TablePagination,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { saveAs } from "file-saver";

export const ComplaintList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [priority, setPriority] = useState("");
  const [viewMode, setViewMode] = useState(""); // categories, sentiments, priorities

  // Read URL parameters on component mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const statusParam = searchParams.get("status");
    const sentimentParam = searchParams.get("sentiment");
    const priorityParam = searchParams.get("priority");
    const viewParam = searchParams.get("view");
    
    if (categoryParam) setCategory(categoryParam);
    if (statusParam) setStatus(statusParam);
    if (sentimentParam) setSentiment(sentimentParam);
    if (priorityParam) setPriority(priorityParam);
    if (viewParam) setViewMode(viewParam);
  }, [searchParams]);

  useEffect(() => {
    fetchComplaints();
  }, [page, rowsPerPage, category, status, sentiment, priority, user.token]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = `/api/complaints?page=${page + 1}&per_page=${rowsPerPage}`;
      if (category) url += `&category=${category}`;
      if (status) url += `&status=${status}`;
      if (sentiment) url += `&sentiment=${sentiment}`;
      if (priority) url += `&priority=${priority}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();
      setComplaints(data.complaints);
      setTotal(data.total);
    } catch (err) {
      toast.error("Error fetching complaints");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0);
  };

  // Group complaints by field
  const groupComplaintsBy = (field) => {
    const grouped = {};
    complaints.forEach((complaint) => {
      const key = complaint[field] || "unknown";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(complaint);
    });
    return grouped;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (status) params.append("status", status);
      params.append("format", format);

      const response = await fetch(
        `/api/complaints/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const filename = `complaints_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      saveAs(blob, filename);
      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export complaints");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Complaints
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="billing">Billing</MenuItem>
              <MenuItem value="delivery">Delivery</MenuItem>
              <MenuItem value="quality">Quality</MenuItem>
              <MenuItem value="service">Service</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={handleStatusChange}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sentiment</InputLabel>
            <Select value={sentiment} label="Sentiment" onChange={(e) => setSentiment(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="negative">😡 Negative</MenuItem>
              <MenuItem value="neutral">😐 Neutral</MenuItem>
              <MenuItem value="positive">😊 Positive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="critical">🔴 Critical</MenuItem>
              <MenuItem value="high">🟠 High</MenuItem>
              <MenuItem value="medium">🟡 Medium</MenuItem>
              <MenuItem value="low">🟢 Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {isAdmin() && (
              <>
                <Tooltip title="Export to CSV">
                  <IconButton
                    onClick={() => handleExport("csv")}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export to PDF">
                  <IconButton
                    onClick={() => handleExport("pdf")}
                    color="secondary"
                    sx={{ mr: 1 }}
                  >
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/complaints/new")}
              sx={{ height: "100%" }}
            >
              New Complaint
            </Button>
          </Box>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : viewMode === "sentiments" ? (
        // Grouped by Sentiment
        <Box>
          {Object.entries(groupComplaintsBy("sentiment")).map(([sentiment, sentimentComplaints]) => (
            <Paper key={sentiment} sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Chip 
                  label={`${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} ${
                    sentiment === "negative" ? "😡" : sentiment === "neutral" ? "😐" : "😊"
                  }`}
                  color={sentiment === "negative" ? "error" : sentiment === "positive" ? "success" : "warning"}
                  sx={{ fontWeight: "bold" }}
                />
                <Typography variant="body2" color="text.secondary">
                  ({sentimentComplaints.length} complaints)
                </Typography>
              </Typography>
              {sentimentComplaints.map((complaint) => (
                <Box key={complaint._id} sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {complaint.text}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <Chip label={complaint.category} size="small" color="primary" />
                    <Chip label={complaint.status} size="small" color={getStatusColor(complaint.status)} />
                    {complaint.priority && <Chip label={complaint.priority} size="small" variant="outlined" />}
                    <Button size="small" variant="outlined" onClick={() => navigate(`/complaints/${complaint._id}`)}>
                      View Details
                    </Button>
                  </Box>
                </Box>
              ))}
            </Paper>
          ))}
        </Box>
      ) : viewMode === "priorities" ? (
        // Grouped by Priority
        <Box>
          {["critical", "high", "medium", "low"].map((priority) => {
            const priorityComplaints = complaints.filter(c => c.priority === priority);
            if (priorityComplaints.length === 0) return null;
            return (
              <Paper key={priority} sx={{ mb: 3, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip 
                    label={`${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`}
                    color={priority === "critical" || priority === "high" ? "error" : priority === "medium" ? "warning" : "success"}
                    sx={{ fontWeight: "bold" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({priorityComplaints.length} complaints)
                  </Typography>
                </Typography>
                {priorityComplaints.map((complaint) => (
                  <Box key={complaint._id} sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {complaint.text}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                      <Chip label={complaint.category} size="small" color="primary" />
                      <Chip label={complaint.status} size="small" color={getStatusColor(complaint.status)} />
                      {complaint.sentiment && (
                        <Chip 
                          label={`${complaint.sentiment} ${
                            complaint.sentiment === "negative" ? "😡" : complaint.sentiment === "neutral" ? "😐" : "😊"
                          }`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Button size="small" variant="outlined" onClick={() => navigate(`/complaints/${complaint._id}`)}>
                        View Details
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Paper>
            );
          })}
        </Box>
      ) : viewMode === "categories" ? (
        // Grouped by Category
        <Box>
          {Object.entries(groupComplaintsBy("category")).map(([category, categoryComplaints]) => (
            <Paper key={category} sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Chip 
                  label={category.charAt(0).toUpperCase() + category.slice(1)}
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                />
                <Typography variant="body2" color="text.secondary">
                  ({categoryComplaints.length} complaints)
                </Typography>
              </Typography>
              {categoryComplaints.map((complaint) => (
                <Box key={complaint._id} sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {complaint.text}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <Chip label={complaint.status} size="small" color={getStatusColor(complaint.status)} />
                    {complaint.sentiment && (
                      <Chip 
                        label={`${complaint.sentiment} ${
                          complaint.sentiment === "negative" ? "😡" : complaint.sentiment === "neutral" ? "😐" : "😊"
                        }`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {complaint.priority && <Chip label={complaint.priority} size="small" variant="outlined" />}
                    <Button size="small" variant="outlined" onClick={() => navigate(`/complaints/${complaint._id}`)}>
                      View Details
                    </Button>
                  </Box>
                </Box>
              ))}
            </Paper>
          ))}
        </Box>
      ) : (
        // Regular Table View
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Text</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint._id}>
                  <TableCell>
                    {complaint.text.length > 100
                      ? `${complaint.text.substring(0, 100)}...`
                      : complaint.text}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={complaint.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={complaint.status}
                      size="small"
                      color={getStatusColor(complaint.status)}
                    />
                  </TableCell>
                  <TableCell>{complaint.submitted_by}</TableCell>
                  <TableCell>
                    {new Date(complaint.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/complaints/${complaint._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </Box>
  );
};
 