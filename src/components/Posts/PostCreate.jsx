import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Save,
  ArrowBack,
  CloudUpload,
  Image as ImageIcon,
  Article as NewsIcon,
  Event as EventIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const PostCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [postForm, setPostForm] = useState({
    type: "news",
    title: "",
    content: "",
    status: "draft",
    start_date: "",
    end_date: "",
    location: "",
  });

  const handleInputChange = (field, value) => {
    setPostForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // Reset status when type changes
      if (field === "type") {
        updated.status = value === "news" ? "draft" : "upcoming";
      }
      
      return updated;
    });
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File too large",
          text: `${file.name} is larger than 10MB`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [
            ...prev,
            { file, preview: reader.result },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleBannerSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File too large",
          text: `${file.name} is larger than 10MB`,
        });
        return;
      }
      setSelectedBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeBanner = () => {
    setSelectedBanner(null);
    setBannerPreview(null);
  };

  const handleCreate = async () => {
    try {
      if (!postForm.title || !postForm.content) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please fill in all required fields (Title and Content)",
        });
        return;
      }

      if (postForm.type === "event" && !postForm.start_date) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Start date is required for events",
        });
        return;
      }

      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("type", postForm.type);
      formData.append("title", postForm.title);
      formData.append("content", postForm.content);
      formData.append("status", postForm.status);
      
      if (postForm.type === "news") {
        // Append multiple images for news
        selectedImages.forEach((image) => {
          formData.append("post_images", image);
        });
      } else if (postForm.type === "event") {
        // Append banner for events
        if (selectedBanner) {
          formData.append("post_banner", selectedBanner);
        }
        if (postForm.start_date) {
          formData.append("start_date", postForm.start_date);
        }
        if (postForm.end_date) {
          formData.append("end_date", postForm.end_date);
        }
        if (postForm.location) {
          formData.append("location", postForm.location);
        }
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: `${postForm.type === "news" ? "News" : "Event"} created successfully!`,
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate("/posts");
      } else {
        throw new Error(result.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.message || "Failed to create post");
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to create post",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
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
              <ArrowBack />
            </IconButton>
            {postForm.type === "news" ? (
              <NewsIcon sx={{ fontSize: 40 }} />
            ) : (
              <EventIcon sx={{ fontSize: 40 }} />
            )}
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                fontSize: { xs: "1.3rem", sm: "1.6rem", md: "1.8rem" },
              }}
            >
              Create New {postForm.type === "news" ? "News" : "Event"}
            </Typography>
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 2, position: "relative", zIndex: 1 }}
            >
              {error}
            </Alert>
          )}
        </Box>

        <Grid container spacing={4} sx={{ width: "100%" }}>
          {/* Basic Information */}
          <Grid item xs={12} sx={{ width: "100%" }}>
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
                  {postForm.type === "news" ? (
                    <NewsIcon sx={{ color: "#2196f3" }} />
                  ) : (
                    <EventIcon sx={{ color: "#ff9800" }} />
                  )}
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Basic Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  {/* Type */}
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel id="type-label" shrink={!!postForm.type}>Post Type</InputLabel>
                      <Select
                        labelId="type-label"
                        value={postForm.type || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          handleInputChange("type", newValue);
                        }}
                        label="Post Type"
                        inputProps={{
                          name: "type",
                          id: "type-select",
                        }}
                      >
                        <MenuItem value="news">
                          <Box display="flex" alignItems="center" gap={1}>
                            <NewsIcon fontSize="small" />
                            News
                          </Box>
                        </MenuItem>
                        <MenuItem value="event">
                          <Box display="flex" alignItems="center" gap={1}>
                            <EventIcon fontSize="small" />
                            Event
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel id="status-label" shrink={!!postForm.status}>Status</InputLabel>
                      <Select
                        key={`status-${postForm.type}`}
                        labelId="status-label"
                        value={postForm.status || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          handleInputChange("status", newValue);
                        }}
                        label="Status"
                        displayEmpty={false}
                        inputProps={{
                          name: "status",
                          id: "status-select",
                        }}
                      >
                        {postForm.type === "news" ? (
                          [
                            <MenuItem key="draft" value="draft">Draft</MenuItem>,
                            <MenuItem key="published" value="published">Published</MenuItem>,
                            <MenuItem key="archived" value="archived">Archived</MenuItem>,
                          ]
                        ) : (
                          [
                            <MenuItem key="upcoming" value="upcoming">Upcoming</MenuItem>,
                            <MenuItem key="ongoing" value="ongoing">Ongoing</MenuItem>,
                            <MenuItem key="completed" value="completed">Completed</MenuItem>,
                            <MenuItem key="cancelled" value="cancelled">Cancelled</MenuItem>,
                          ]
                        )}
                      </Select>
                      <Typography variant="caption" sx={{ mt: 1, color: "text.secondary", display: "block" }}>
                        {postForm.type === "news" 
                          ? "Default: Draft - Posts start as drafts and can be published later"
                          : "Default: Upcoming - Events start as upcoming and can be updated to ongoing/completed"}
                      </Typography>
                    </FormControl>
                  </Grid>

                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title *"
                      value={postForm.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>

                  {/* Content */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Content *"
                      multiline
                      rows={4}
                      value={postForm.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      required
                    />
                  </Grid>

                  {/* Event-specific fields */}
                  {postForm.type === "event" && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Start Date *"
                          type="datetime-local"
                          value={postForm.start_date}
                          onChange={(e) => handleInputChange("start_date", e.target.value)}
                          required
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "transparent",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="datetime-local"
                          value={postForm.end_date}
                          onChange={(e) => handleInputChange("end_date", e.target.value)}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "transparent",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Location"
                          value={postForm.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "transparent",
                            },
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Image Upload */}
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
                    {postForm.type === "news" ? "Images" : "Banner"}
                  </Typography>
                </Box>

                {postForm.type === "news" ? (
                  <>
                    <Box mb={3}>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="images-upload"
                        type="file"
                        multiple
                        onChange={handleImageSelect}
                      />
                      <label htmlFor="images-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={{
                            color: "#43e97b",
                            borderColor: "#43e97b",
                            "&:hover": {
                              borderColor: "#43e97b",
                              backgroundColor: "rgba(67, 233, 123, 0.1)",
                            },
                          }}
                        >
                          Upload Images
                        </Button>
                      </label>
                    </Box>

                    {imagePreviews.length > 0 && (
                      <Grid container spacing={2}>
                        {imagePreviews.map((preview, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                                position: "relative",
                              }}
                            >
                              <IconButton
                                onClick={() => removeSelectedImage(index)}
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                                  },
                                  zIndex: 2,
                                }}
                                size="small"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                              <img
                                src={preview.preview}
                                alt={preview.file.name}
                                style={{
                                  width: "100%",
                                  height: "150px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </>
                ) : (
                  <>
                    <Box mb={3}>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="banner-upload"
                        type="file"
                        onChange={handleBannerSelect}
                      />
                      <label htmlFor="banner-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={{
                            color: "#43e97b",
                            borderColor: "#43e97b",
                            "&:hover": {
                              borderColor: "#43e97b",
                              backgroundColor: "rgba(67, 233, 123, 0.1)",
                            },
                          }}
                        >
                          Upload Banner
                        </Button>
                      </label>
                    </Box>

                    {bannerPreview && (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "#f8f9fa",
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                          position: "relative",
                        }}
                      >
                        <IconButton
                          onClick={removeBanner}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                            zIndex: 2,
                          }}
                          size="small"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          style={{
                            width: "100%",
                            maxHeight: "300px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
              }}
            >
              <CardContent>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleCreate}
                    disabled={saving}
                    sx={{
                      flex: 1,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      },
                    }}
                  >
                    {saving ? "Creating..." : "Create Post"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/posts")}
                    sx={{
                      flex: 1,
                      color: "#667eea",
                      borderColor: "#667eea",
                      "&:hover": {
                        borderColor: "#667eea",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PostCreate;

