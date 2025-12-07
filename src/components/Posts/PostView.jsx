import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Container,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Article as NewsIcon,
  Event as EventIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPost(result.data);
      } else {
        setError(result.message || "Failed to fetch post details");
      }
    } catch (err) {
      setError("Failed to fetch post details");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status, type) => {
    if (type === "news") {
      const labels = {
        draft: "Draft",
        published: "Published",
        archived: "Archived",
      };
      return labels[status] || status;
    } else {
      const labels = {
        upcoming: "Upcoming",
        ongoing: "Ongoing",
        completed: "Completed",
        cancelled: "Cancelled",
      };
      return labels[status] || status;
    }
  };

  const getStatusColor = (status, type) => {
    if (type === "news") {
      const colors = {
        draft: "#9e9e9e",
        published: "#4caf50",
        archived: "#757575",
      };
      return colors[status] || "#667eea";
    } else {
      const colors = {
        upcoming: "#2196f3",
        ongoing: "#ff9800",
        completed: "#4caf50",
        cancelled: "#f44336",
      };
      return colors[status] || "#667eea";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || "Post not found"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/posts")}
          sx={{ mt: 2 }}
        >
          Back to Posts
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <IconButton
              onClick={() => navigate("/posts")}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            {post.type === "news" ? (
              <NewsIcon sx={{ fontSize: 40 }} />
            ) : (
              <EventIcon sx={{ fontSize: 40 }} />
            )}
            <Box flex={1}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  fontSize: { xs: "1.3rem", sm: "1.6rem", md: "1.8rem" },
                }}
              >
                {post.title}
              </Typography>
              <Stack direction="row" spacing={2} mt={1}>
                <Chip
                  label={post.type === "news" ? "News" : "Event"}
                  sx={{
                    backgroundColor: post.type === "news" ? "#2196f3" : "#ff9800",
                    color: "white",
                  }}
                />
                <Chip
                  label={getStatusLabel(post.status, post.type)}
                  sx={{
                    backgroundColor: getStatusColor(post.status, post.type),
                    color: "white",
                  }}
                />
              </Stack>
            </Box>
            <Button
              startIcon={<EditIcon />}
              onClick={() => navigate(`/posts/${id}/edit`)}
              sx={{
                color: "white",
                borderColor: "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
              variant="outlined"
            >
              Edit
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={4} sx={{ width: "100%" }}>
          <Grid item xs={12} sx={{ width: "100%" }}>
            {/* Basic Information */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  {post.type === "news" ? (
                    <NewsIcon sx={{ color: "#2196f3" }} />
                  ) : (
                    <EventIcon sx={{ color: "#ff9800" }} />
                  )}
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Basic Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Type
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {post.type === "news" ? "News" : "Event"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Status
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getStatusLabel(post.status, post.type)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Title
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {post.title}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Content
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
                      >
                        {post.content}
                      </Typography>
                    </Box>
                  </Grid>

                  {post.type === "event" && (
                    <>
                      {post.start_date && (
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                              Start Date
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {new Date(post.start_date).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {post.end_date && (
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                              End Date
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {new Date(post.end_date).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {post.location && (
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                              Location
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {post.location}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Images/Banner */}
            {(post.type === "news" && post.images && post.images.length > 0) ||
            (post.type === "event" && post.banner) ? (
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  mb: 3,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ImageIcon sx={{ color: "#43e97b" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      {post.type === "news" ? "Images" : "Banner"}
                    </Typography>
                  </Box>

                  {post.type === "news" && post.images && post.images.length > 0 && (
                    <Grid container spacing={2}>
                      {post.images.map((imageObj, index) => {
                        const imagePath =
                          typeof imageObj === "object" ? imageObj.path : imageObj;
                        return (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <img
                              src={buildImageUrl(imagePath)}
                              alt={`${post.title} - Image ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}

                  {post.type === "event" && post.banner && (
                    <img
                      src={buildImageUrl(post.banner)}
                      alt={`${post.title} - Banner`}
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Additional Details */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  {post.type === "news" ? (
                    <NewsIcon sx={{ color: "#4facfe" }} />
                  ) : (
                    <EventIcon sx={{ color: "#4facfe" }} />
                  )}
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Additional Details
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  {post.creator && (
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                          Created By
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {post.creator.full_name || post.creator.email}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Created At
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {new Date(post.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Updated At
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {new Date(post.updatedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PostView;

