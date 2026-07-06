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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Article as NewsIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import { brand } from "../../brandColors";
import { fieldSx } from "../Projects/projectFormUi";
import {
  listPaperSx,
  ListPageHeader,
  createButtonSx,
  tableContainerSx,
  tableHeadRowSx,
  tableRowSx,
  paginationSx,
  actionButtonSx,
  filterBarSx,
} from "../Util/adminListUi";

const getTypeStyle = (type) =>
  type === "news"
    ? { bg: alpha(brand.blue, 0.12), color: brand.blue, border: alpha(brand.blue, 0.35), label: "News" }
    : { bg: alpha(brand.gold, 0.15), color: "#b8860b", border: alpha(brand.gold, 0.4), label: "Event" };

const getStatusStyle = (status, type) => {
  const newsStyles = {
    draft: { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, label: "Draft" },
    published: { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Published" },
    archived: { bg: alpha("#757575", 0.12), color: "#616161", label: "Archived" },
  };
  const eventStyles = {
    upcoming: { bg: alpha(brand.blue, 0.12), color: brand.blue, label: "Upcoming" },
    ongoing: { bg: alpha(brand.gold, 0.18), color: "#e65100", label: "Ongoing" },
    completed: { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Completed" },
    cancelled: { bg: alpha("#c62828", 0.1), color: "#c62828", label: "Cancelled" },
  };
  const styles = type === "news" ? newsStyles : eventStyles;
  return styles[status] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, label: status };
};

const Posts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPosts, setTotalPosts] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [page, rowsPerPage, typeFilter, statusFilter, searchQuery]);

  const fetchPosts = async () => {
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

      if (typeFilter !== "all") queryParams.append("type", typeFilter);
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (searchQuery) queryParams.append("search", searchQuery);

      const response = await fetch(`/api/posts?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPosts(data.data || []);
        setTotalPosts(data.pagination?.total || 0);
      } else {
        setError("Failed to fetch posts: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error fetching posts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeletePost = async (post) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${post.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c62828",
      cancelButtonColor: brand.navy,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const deleteResult = await response.json();
      if (!response.ok) throw new Error(deleteResult.message || "Failed to delete post");

      fetchPosts();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Post has been deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: brand.green,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete post. Please try again.",
        confirmButtonColor: brand.green,
      });
    } finally {
      setLoading(false);
    }
  };

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  const getPostImage = (post) => {
    if (post.type === "news" && post.images?.length > 0) {
      const firstImage = post.images[0];
      const path = typeof firstImage === "object" ? firstImage.path : firstImage;
      return buildImageUrl(path);
    }
    if (post.type === "event" && post.banner) return buildImageUrl(post.banner);
    return null;
  };

  return (
    <Box>
      <Paper elevation={0} sx={listPaperSx}>
        <ListPageHeader
          icon={NewsIcon}
          title="Posts Management"
          subtitle="Manage news and events for the public portal"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/posts/create")}
              sx={createButtonSx}
            >
              Create New Post
            </Button>
          }
        />

        <Box sx={filterBarSx}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ flex: 1, minWidth: 200, ...fieldSx }}
            />
            <FormControl size="small" sx={{ minWidth: 150, ...fieldSx }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="news">News</MenuItem>
                <MenuItem value="event">Events</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150, ...fieldSx }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer sx={tableContainerSx}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={tableHeadRowSx}>
                  <TableCell>No</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress sx={{ color: brand.green }} size={36} />
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <NewsIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2), mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        No posts found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post, idx) => {
                    const typeStyle = getTypeStyle(post.type);
                    const statusStyle = getStatusStyle(post.status, post.type);

                    return (
                      <TableRow key={post.id} hover sx={tableRowSx}>
                        <TableCell sx={{ fontWeight: 700, color: brand.navy, width: 48 }}>
                          {page * rowsPerPage + idx + 1}
                        </TableCell>
                        <TableCell>
                          <Avatar
                            src={getPostImage(post)}
                            alt={post.title}
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1.5,
                              bgcolor: typeStyle.bg,
                              color: typeStyle.color,
                              border: `1px solid ${typeStyle.border}`,
                            }}
                          >
                            {post.type === "news" ? <NewsIcon /> : <EventIcon />}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={typeStyle.label}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              bgcolor: typeStyle.bg,
                              color: typeStyle.color,
                              border: `1px solid ${typeStyle.border}`,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color={brand.navy}>
                            {post.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={brand.sidebarTextMuted}
                            sx={{
                              maxWidth: 280,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {post.content}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusStyle.label}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            <Tooltip title="View details" arrow>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/posts/${post.id}`)}
                                sx={actionButtonSx.view}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit post" arrow>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/posts/${post.id}/edit`)}
                                sx={actionButtonSx.edit}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete post" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePost(post)}
                                sx={actionButtonSx.delete}
                              >
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
            count={totalPosts}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={paginationSx}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Posts;
