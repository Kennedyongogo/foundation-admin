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
import { RateReview as TestimonyIcon } from "@mui/icons-material";

const Testimony = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTestimonies, setTotalTestimonies] = useState(0);

  useEffect(() => {
    fetchTestimonies();
  }, [page, rowsPerPage]);

  const fetchTestimonies = async () => {
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

      const response = await fetch(`/api/testimonies?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTestimonies(data.data || []);
        setTotalTestimonies(data.pagination?.total || 0);
      } else {
        setError(
          "Failed to fetch testimonies: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching testimonies: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: alpha(brand.gold, 0.18), color: "#e65100", label: "Pending" },
      approved: { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Approved" },
      rejected: { bg: alpha("#c62828", 0.1), color: "#c62828", label: "Rejected" },
    };
    return styles[status] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, label: status };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const getRatingStars = (rating) => {
    return 'â­'.repeat(rating);
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

  const handleViewTestimony = (testimony) => {
    setSelectedTestimony(testimony);
    setOpenViewDialog(true);
  };

  const handleEditTestimony = (testimony) => {
    setSelectedTestimony(testimony);
    setEditForm({
      status: testimony.status,
    });
    setOpenEditDialog(true);
  };

  const handleUpdateTestimony = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/testimonies/${selectedTestimony.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update testimony");
      }

      // Close dialog and refresh testimonies
      setOpenEditDialog(false);
      setSelectedTestimony(null);
      fetchTestimonies();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Testimony has been updated successfully.",
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
      console.error("Error updating testimony:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update testimony. Please try again.",
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

  const handleDeleteTestimony = async (testimony) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete this testimony?`,
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

        const response = await fetch(`/api/testimonies/${testimony.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete testimony");
        }

        // Refresh testimonies list
        fetchTestimonies();

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Testimony has been deleted successfully.",
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
        console.error("Error deleting testimony:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete testimony. Please try again.",
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

  if (error && testimonies.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={listPaperSx}>
        <ListPageHeader icon={TestimonyIcon} title="Testimonies Management" subtitle="Manage and moderate user testimonies" />

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <TableContainer sx={tableContainerSx}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow sx={tableHeadRowSx}>
                  <TableCell>No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress sx={{ color: brand.green }} size={36} /></TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert><Button variant="contained" onClick={fetchTestimonies} sx={{ bgcolor: brand.green }}>Retry</Button></TableCell></TableRow>
                ) : testimonies.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><TestimonyIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2), mb: 1 }} /><Typography variant="body1" color="text.secondary">No testimonies found.</Typography></TableCell></TableRow>
                ) : (
                  testimonies.map((testimony, idx) => {
                    const statusStyle = getStatusStyle(testimony.status);
                    return (
                      <TableRow key={testimony.id} hover sx={tableRowSx}>
                        <TableCell sx={{ fontWeight: 700, color: brand.navy }}>{page * rowsPerPage + idx + 1}</TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600} color={brand.navy}>{testimony.name}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600} color={brand.gold}>{getRatingStars(testimony.rating)}</Typography></TableCell>
                        <TableCell><Chip label={statusStyle.label} size="small" sx={{ fontWeight: 600, bgcolor: statusStyle.bg, color: statusStyle.color }} /></TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            <Tooltip title="View details" arrow><IconButton size="small" onClick={() => handleViewTestimony(testimony)} sx={actionButtonSx.view}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Edit status" arrow><IconButton size="small" onClick={() => handleEditTestimony(testimony)} sx={actionButtonSx.edit}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete" arrow><IconButton size="small" onClick={() => handleDeleteTestimony(testimony)} sx={actionButtonSx.delete}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={totalTestimonies} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25, 50]} sx={paginationSx} />
        </Box>

        <Dialog open={openViewDialog} onClose={() => { setOpenViewDialog(false); setSelectedTestimony(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
          <BrandedDialogTitle icon={TestimonyIcon} title="Testimony Details" subtitle="View testimony information" />
          <DialogContent sx={{ p: 3, bgcolor: brand.sidebarBg }}>
            {selectedTestimony && (
              <Stack spacing={2}>
                <Box sx={{ ...detailCardSx, bgcolor: alpha(brand.navy, 0.04) }}>
                  <Typography variant="h6" fontWeight={800} color={brand.navy}>{selectedTestimony.name}</Typography>
                  <Typography variant="body1" color={brand.gold} mt={1}>{getRatingStars(selectedTestimony.rating)} ({selectedTestimony.rating}/5)</Typography>
                </Box>
                <DetailRow icon={CheckCircleIcon} label="STATUS" value={getStatusText(selectedTestimony.status)} color={brand.green} />
                <DetailRow icon={ScheduleIcon} label="CREATED" value={formatDate(selectedTestimony.createdAt)} />
                <Box sx={detailCardSx}>
                  <Typography variant="caption" color={brand.sidebarTextMuted} fontWeight={600}>DESCRIPTION</Typography>
                  <Typography variant="body2" color={brand.navy} sx={{ mt: 0.5, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{selectedTestimony.description}</Typography>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={dialogActionsSx}><Button onClick={() => { setOpenViewDialog(false); setSelectedTestimony(null); }} variant="outlined" sx={cancelButtonSx}>Close</Button></DialogActions>
        </Dialog>

        <Dialog open={openEditDialog} onClose={() => { setOpenEditDialog(false); setSelectedTestimony(null); setEditForm({ status: "" }); }} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
          <BrandedDialogTitle icon={UpdateIcon} title="Manage Testimony Status" subtitle="Approve or reject for public display" />
          <DialogContent sx={{ p: 3, bgcolor: brand.sidebarBg }}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {selectedTestimony && (
                <Box sx={{ ...detailCardSx, bgcolor: brand.sidebarBgAlt }}>
                  <Typography variant="subtitle1" fontWeight={700} color={brand.navy}>{selectedTestimony.name}</Typography>
                  <Typography variant="body2" color={brand.gold} mt={0.5}>{getRatingStars(selectedTestimony.rating)}</Typography>
                  <Typography variant="body2" color={brand.sidebarTextMuted} sx={{ mt: 1, fontStyle: "italic" }}>"{selectedTestimony.description}"</Typography>
                </Box>
              )}
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Status</InputLabel>
                <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} label="Status" required>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={dialogActionsSx}>
            <Button onClick={() => { setOpenEditDialog(false); setSelectedTestimony(null); setEditForm({ status: "" }); }} variant="outlined" sx={cancelButtonSx}>Cancel</Button>
            <Button onClick={handleUpdateTestimony} variant="contained" disabled={loading} sx={saveButtonSx}>{loading ? "Updating..." : "Update Status"}</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Testimony;
