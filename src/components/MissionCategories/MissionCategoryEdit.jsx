import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Favorite as MissionIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const MissionCategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    description: "",
    category: "educational_support",
    impact: "",
  });

  const categoryOptions = [
    { value: "educational_support", label: "Educational Support", color: "#2196f3" },
    { value: "mental_health_awareness", label: "Mental Health Awareness", color: "#e91e63" },
    { value: "poverty_alleviation", label: "Poverty Alleviation", color: "#4caf50" },
    { value: "community_empowerment", label: "Community Empowerment", color: "#ff9800" },
    { value: "healthcare_access", label: "Healthcare Access", color: "#9c27b0" },
    { value: "youth_development", label: "Youth Development", color: "#00bcd4" },
  ];

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/mission-categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        const category = result.data;
        setCategoryForm({
          title: category.title || "",
          description: category.description || "",
          category: category.category || "educational_support",
          impact: category.impact || "",
        });
        
        // Set existing images
        if (category.images && Array.isArray(category.images)) {
          const imageUrls = category.images.map((img) => {
            const path = typeof img === 'object' ? img.path : img;
            return buildImageUrl(path);
          });
          setExistingImages(imageUrls);
        } else if (category.image) {
          // Backward compatibility with single image
          const imageUrl = buildImageUrl(category.image);
          setExistingImages([imageUrl]);
        }
      } else {
        setError(result.message || "Failed to fetch mission category");
      }
    } catch (err) {
      setError("Failed to fetch mission category: " + err.message);
      console.error("Error fetching mission category:", err);
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

  const handleInputChange = (field, value) => {
    setCategoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      
      // Create previews for new files
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

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    try {
      if (!categoryForm.title || !categoryForm.description) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please fill in all required fields (Title and Description)",
        });
        return;
      }

      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", categoryForm.title);
      formData.append("description", categoryForm.description);
      formData.append("category", categoryForm.category);
      if (categoryForm.impact) formData.append("impact", categoryForm.impact);
      
      // Append existing images to keep
      existingImages.forEach((imageUrl) => {
        // Extract path from URL
        const path = imageUrl.replace(/^\/uploads\//, 'uploads/').replace(/^\//, '');
        formData.append("existing_images", path);
      });
      
      // Append new images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(`/api/mission-categories/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Mission category updated successfully!",
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate("/mission-categories");
      } else {
        throw new Error(result.message || "Failed to update mission category");
      }
    } catch (error) {
      console.error("Error updating mission category:", error);
      setError(error.message || "Failed to update mission category");
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update mission category",
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
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="lg" sx={{ px: 0 }}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            position="relative"
            zIndex={1}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/mission-categories")}
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Back
              </Button>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
                    whiteSpace: "nowrap",
                  }}
                >
                  Edit Mission Category
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Update mission category details
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleUpdate}
              disabled={saving}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:disabled": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ flexDirection: "column" }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <MissionIcon sx={{ color: "#667eea" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Basic Information
                    </Typography>
                  </Box>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Title *"
                      value={categoryForm.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description *"
                      value={categoryForm.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                    <FormControl
                      fullWidth
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={categoryForm.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        label="Category"
                      >
                        {categoryOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: option.color,
                                }}
                              />
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Impact"
                      value={categoryForm.impact}
                      onChange={(e) => handleInputChange("impact", e.target.value)}
                      helperText="e.g., High Impact"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ImageIcon sx={{ color: "#43e97b" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Category Image
                    </Typography>
                  </Box>
                  <Box mb={3}>
                    <input
                      type="file"
                      multiple
                      onChange={handleImageSelect}
                      style={{ display: "none" }}
                      id="images-upload"
                      accept="image/*"
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

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" mb={2}>
                        Current Images ({existingImages.length}):
                      </Typography>
                      <Grid container spacing={2}>
                        {existingImages.map((imageUrl, index) => {
                          const fileName = imageUrl.split("/").pop() || `Image ${index + 1}`;
                          return (
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
                                  onClick={() => removeExistingImage(index)}
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
                                  src={imageUrl}
                                  alt={fileName}
                                  style={{
                                    width: "100%",
                                    height: "150px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    marginBottom: "8px",
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#333",
                                    display: "block",
                                    textAlign: "center",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {fileName}
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}

                  {/* New Selected Images Preview */}
                  {imagePreviews.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" mb={2}>
                        New Images ({imagePreviews.length}):
                      </Typography>
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
                                  marginBottom: "8px",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#333",
                                  display: "block",
                                  textAlign: "center",
                                  wordBreak: "break-word",
                                }}
                              >
                                {preview.file.name}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {existingImages.length === 0 && imagePreviews.length === 0 && (
                    <Box
                      sx={{
                        border: "2px dashed #ccc",
                        borderRadius: 2,
                        p: 3,
                        textAlign: "center",
                        bgcolor: "#f9f9f9",
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                        No images. Click "Upload Images" to add images.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default MissionCategoryEdit;

