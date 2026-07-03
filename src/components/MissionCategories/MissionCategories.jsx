import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
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
  Chip,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Favorite as MissionIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import { brand } from "../../brandColors";
import {
  outerPaperSx,
  pageHeaderSx,
  getMissionCategoryLabel,
  getMissionCategoryColor,
} from "../Projects/projectFormUi";

const MissionCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCategories, setTotalCategories] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage]);

  const fetchCategories = async () => {
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

      const response = await fetch(`/api/mission-categories?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCategories(data.data || []);
        setTotalCategories(data.pagination?.total || 0);
      } else {
        setError("Failed to fetch mission categories: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error fetching mission categories: " + err.message);
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

  const handleViewCategory = (category) => {
    navigate(`/mission-categories/${category.id}`);
  };

  const handleEditCategory = (category) => {
    navigate(`/mission-categories/${category.id}/edit`);
  };

  const handleDeleteCategory = async (category) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${category.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c62828",
      cancelButtonColor: brand.navy,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: { container: "swal-z-index-fix" },
      didOpen: () => {
        const swalContainer = document.querySelector(".swal-z-index-fix");
        if (swalContainer) swalContainer.style.zIndex = "9999";
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

        const response = await fetch(`/api/mission-categories/${category.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const deleteResult = await response.json();

        if (!response.ok) {
          throw new Error(deleteResult.message || "Failed to delete mission category");
        }

        fetchCategories();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Mission category has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
          customClass: { container: "swal-z-index-fix" },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) swalContainer.style.zIndex = "9999";
          },
        });
      } catch (err) {
        console.error("Error deleting mission category:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete mission category. Please try again.",
          confirmButtonColor: brand.green,
          customClass: { container: "swal-z-index-fix" },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) swalContainer.style.zIndex = "9999";
          },
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  const getFirstImage = (category) => {
    if (category.images && Array.isArray(category.images) && category.images.length > 0) {
      const firstImage = category.images[0];
      const path = typeof firstImage === "object" ? firstImage.path : firstImage;
      return buildImageUrl(path);
    }
    if (category.image) {
      return buildImageUrl(category.image);
    }
    return null;
  };

  const paginatedCategories = categories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && categories.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress sx={{ color: brand.green }} size={48} />
      </Box>
    );
  }

  if (error && categories.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={outerPaperSx}>
        <Box sx={pageHeaderSx}>
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.06),
            }}
          />
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
            position="relative"
            zIndex={1}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha("#fff", 0.12),
                  border: `1px solid ${alpha(brand.gold, 0.45)}`,
                }}
              >
                <MissionIcon sx={{ fontSize: 28, color: brand.gold }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                    lineHeight: 1.2,
                  }}
                >
                  Mission Categories
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.5 }}>
                  Manage mission categories for the public portal
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/mission-categories/create")}
              sx={{
                bgcolor: brand.green,
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: `0 6px 20px ${alpha(brand.green, 0.45)}`,
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  bgcolor: brand.greenLight,
                  boxShadow: `0 8px 24px ${alpha(brand.green, 0.5)}`,
                  transform: "translateY(-1px)",
                },
              }}
            >
              Create New Category
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer
            sx={{
              borderRadius: 2,
              overflowX: "auto",
              border: `1px solid ${brand.sidebarBorder}`,
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: alpha(brand.navy, 0.25),
                borderRadius: 3,
              },
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: brand.navy,
                    "& .MuiTableCell-head": {
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: `2px solid ${brand.gold}`,
                      py: 1.75,
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>No</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
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
                      <Typography color="error" variant="body1" fontWeight={600}>
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <MissionIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2), mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        No mission categories found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCategories.map((category, idx) => (
                    <TableRow
                      key={category.id}
                      hover
                      sx={{
                        "&:nth-of-type(even)": { bgcolor: brand.sidebarBgAlt },
                        "&:hover": { bgcolor: alpha(brand.green, 0.06) },
                        "& .MuiTableCell-root": {
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          py: { xs: 1.25, sm: 1.75 },
                          borderColor: brand.sidebarBorder,
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: brand.navy, width: 48 }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Avatar
                          src={getFirstImage(category)}
                          alt={category.title}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: getMissionCategoryColor(category.category),
                          }}
                        >
                          <MissionIcon />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={brand.navy}>
                          {category.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={brand.sidebarTextMuted}
                          sx={{
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {category.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getMissionCategoryLabel(category.category)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: alpha(getMissionCategoryColor(category.category), 0.12),
                            color: getMissionCategoryColor(category.category),
                            border: `1px solid ${alpha(getMissionCategoryColor(category.category), 0.35)}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewCategory(category)}
                              sx={{
                                color: brand.green,
                                bgcolor: alpha(brand.green, 0.1),
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: alpha(brand.green, 0.2) },
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit category" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditCategory(category)}
                              sx={{
                                color: brand.blue,
                                bgcolor: alpha(brand.blue, 0.1),
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: alpha(brand.blue, 0.18) },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete category" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteCategory(category)}
                              sx={{
                                color: "#c62828",
                                bgcolor: alpha("#c62828", 0.08),
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: alpha("#c62828", 0.15) },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCategories}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: `1px solid ${brand.sidebarBorder}`,
              "& .MuiTablePagination-toolbar": { color: brand.navy },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                color: brand.sidebarTextMuted,
                fontWeight: 500,
              },
              "& .MuiIconButton-root": {
                color: brand.navy,
                "&.Mui-disabled": { color: alpha(brand.navy, 0.3) },
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default MissionCategories;
