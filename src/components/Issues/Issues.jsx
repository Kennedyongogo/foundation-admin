import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Construction as ProjectIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import { brand } from "../../brandColors";
import { fieldSx } from "../Projects/projectFormUi";
import {
  listPaperSx,
  ListPageHeader,
  tableContainerSx,
  tableHeadRowSx,
  tableRowSx,
  paginationSx,
  actionButtonSx,
  dialogPaperSx,
  BrandedDialogTitle,
  DetailRow,
  dialogActionsSx,
  saveButtonSx,
  cancelButtonSx,
  detailCardSx,
} from "../Util/adminListUi";

const Issues = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
    category: "",
    status: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalIssues, setTotalIssues] = useState(0);

  useEffect(() => {
    fetchIssues();
  }, [page, rowsPerPage]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      const response = await fetch(`/api/inquiries?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setIssues(data.data || []);
        setTotalIssues(data.pagination?.total || 0);
      } else {
        setError(
          "Failed to fetch issues: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching issues: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: alpha(brand.gold, 0.18), color: "#e65100", label: "Pending" },
      in_progress: { bg: alpha(brand.blue, 0.12), color: brand.blue, label: "In Progress" },
      resolved: { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Resolved" },
    };
    return styles[status] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, label: status };
  };

  const getCategoryStyle = (category) => {
    const styles = {
      volunteer: { bg: alpha(brand.green, 0.12), color: brand.greenDark, border: alpha(brand.green, 0.35) },
      education: { bg: alpha(brand.navy, 0.1), color: brand.navy, border: alpha(brand.navy, 0.3) },
      mental_health: { bg: alpha(brand.blue, 0.12), color: brand.blue, border: alpha(brand.blue, 0.35) },
      community: { bg: alpha(brand.greenLight, 0.15), color: brand.greenDark, border: alpha(brand.green, 0.3) },
      donation: { bg: alpha(brand.gold, 0.15), color: "#b8860b", border: alpha(brand.gold, 0.4) },
      partnership: { bg: alpha(brand.blueLight, 0.12), color: brand.blue, border: alpha(brand.blue, 0.3) },
    };
    return styles[category] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, border: brand.sidebarBorder };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "resolved":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return status;
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case "volunteer":
        return "Volunteer";
      case "education":
        return "Education";
      case "mental_health":
        return "Mental Health";
      case "community":
        return "Community";
      case "donation":
        return "Donation";
      case "partnership":
        return "Partnership";
      default:
        return category;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setOpenViewDialog(true);
  };

  const handleEditIssue = (issue) => {
    setSelectedIssue(issue);
    setEditForm({
      full_name: issue.full_name,
      email: issue.email,
      phone: issue.phone || "",
      message: issue.message,
      category: issue.category,
      status: issue.status,
    });
    setOpenEditDialog(true);
  };

  const handleUpdateIssue = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/inquiries/${selectedIssue.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update issue");
      }

      // Close dialog and refresh issues
      setOpenEditDialog(false);
      setSelectedIssue(null);
      fetchIssues();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Issue has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error updating issue:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update issue. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async (issue) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete inquiry from "${issue.full_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        container: "swal-z-index-fix",
      },
      didOpen: () => {
        const swalContainer = document.querySelector(".swal-z-index-fix");
        if (swalContainer) {
          swalContainer.style.zIndex = "9999";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(`/api/inquiries/${issue.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete issue");
        }

        // Refresh issues list
        fetchIssues();

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Issue has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } catch (err) {
        console.error("Error deleting issue:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete issue. Please try again.",
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (error && issues.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={listPaperSx}>
        <ListPageHeader
          icon={WarningIcon}
          title="Issues Management"
          subtitle="Track and manage project issues and inquiries"
        />

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <TableContainer sx={tableContainerSx}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={tableHeadRowSx}>
                  <TableCell>No</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress sx={{ color: brand.green }} size={36} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                      <Button variant="contained" onClick={fetchIssues} sx={{ bgcolor: brand.green, "&:hover": { bgcolor: brand.greenLight } }}>
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : issues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <WarningIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2), mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        No inquiries found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  issues.map((issue, idx) => {
                    const catStyle = getCategoryStyle(issue.category);
                    const statusStyle = getStatusStyle(issue.status);
                    return (
                    <TableRow key={issue.id} hover sx={tableRowSx}>
                      <TableCell sx={{ fontWeight: 700, color: brand.navy, width: 48 }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={brand.navy}>
                          {issue.full_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getCategoryText(issue.category)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: catStyle.bg,
                            color: catStyle.color,
                            border: `1px solid ${catStyle.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusStyle.label}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: statusStyle.bg, color: statusStyle.color }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={brand.sidebarTextMuted} fontWeight={500}>
                          {formatDate(issue.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View details" arrow>
                            <IconButton size="small" onClick={() => handleViewIssue(issue)} sx={actionButtonSx.view}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit issue" arrow>
                            <IconButton size="small" onClick={() => handleEditIssue(issue)} sx={actionButtonSx.edit}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete issue" arrow>
                            <IconButton size="small" onClick={() => handleDeleteIssue(issue)} sx={actionButtonSx.delete}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalIssues}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={paginationSx}
          />
        </Box>

        <Dialog
          open={openViewDialog}
          onClose={() => { setOpenViewDialog(false); setSelectedIssue(null); }}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: dialogPaperSx }}
        >
          <BrandedDialogTitle icon={WarningIcon} title="Issue Details" subtitle="View inquiry information" />
          <DialogContent sx={{ p: 3, bgcolor: brand.sidebarBg }}>
            {selectedIssue && (
              <Box>
                <Box sx={{ ...detailCardSx, mb: 2, bgcolor: alpha(brand.navy, 0.04) }}>
                  <Typography variant="h6" fontWeight={800} color={brand.navy}>{selectedIssue.full_name}</Typography>
                </Box>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <DetailRow icon={EmailIcon} label="EMAIL" value={selectedIssue.email} color={brand.blue} />
                  <DetailRow icon={PersonIcon} label="PHONE" value={selectedIssue.phone || "N/A"} />
                  <DetailRow icon={CategoryIcon} label="CATEGORY" value={getCategoryText(selectedIssue.category)} color={brand.gold} />
                  <DetailRow icon={CheckCircleIcon} label="STATUS" value={getStatusText(selectedIssue.status)} color={brand.green} />
                  <DetailRow icon={ScheduleIcon} label="CREATED" value={formatDate(selectedIssue.createdAt)} />
                </Stack>
                <Typography variant="subtitle2" fontWeight={700} color={brand.navy} mb={1}>Message</Typography>
                <Box sx={{ ...detailCardSx, bgcolor: brand.sidebarBgAlt }}>
                  <Typography variant="body2" color={brand.navy} sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                    {selectedIssue.message}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={dialogActionsSx}>
            <Button onClick={() => { setOpenViewDialog(false); setSelectedIssue(null); }} variant="outlined" sx={cancelButtonSx}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedIssue(null);
            setEditForm({ full_name: "", email: "", phone: "", message: "", category: "", status: "" });
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: dialogPaperSx }}
        >
          <BrandedDialogTitle icon={UpdateIcon} title="Edit Issue" subtitle="Update inquiry information" />
          <DialogContent sx={{ p: 3, bgcolor: brand.sidebarBg }}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField fullWidth label="Full Name" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} required size="small" sx={fieldSx} />
              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <TextField fullWidth label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required size="small" sx={fieldSx} />
                <TextField fullWidth label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} size="small" sx={fieldSx} />
              </Box>
              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <InputLabel>Category</InputLabel>
                  <Select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} label="Category" required>
                    <MenuItem value="volunteer">Volunteer</MenuItem>
                    <MenuItem value="education">Education</MenuItem>
                    <MenuItem value="mental_health">Mental Health</MenuItem>
                    <MenuItem value="community">Community</MenuItem>
                    <MenuItem value="donation">Donation</MenuItem>
                    <MenuItem value="partnership">Partnership</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <InputLabel>Status</InputLabel>
                  <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} label="Status" required>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField fullWidth label="Message" value={editForm.message} onChange={(e) => setEditForm({ ...editForm, message: e.target.value })} multiline rows={4} required size="small" sx={fieldSx} />
            </Stack>
          </DialogContent>
          <DialogActions sx={dialogActionsSx}>
            <Button
              onClick={() => {
                setOpenEditDialog(false);
                setSelectedIssue(null);
                setEditForm({ full_name: "", email: "", phone: "", message: "", category: "", status: "" });
              }}
              variant="outlined"
              sx={cancelButtonSx}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateIssue} variant="contained" disabled={loading} sx={saveButtonSx}>
              {loading ? "Updating…" : "Update Issue"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Issues;
