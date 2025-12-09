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
  Favorite as MissionIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const MissionCategoryCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    description: "",
    category: "educational_support",
    impact: [],
  });
  const [impactInputs, setImpactInputs] = useState([""]);

  const categoryOptions = [
    { value: "educational_support", label: "Educational Support", color: "#2196f3" },
    { value: "mental_health_awareness", label: "Mental Health Awareness", color: "#e91e63" },
    { value: "poverty_alleviation", label: "Poverty Alleviation", color: "#4caf50" },
    { value: "community_empowerment", label: "Community Empowerment", color: "#ff9800" },
    { value: "healthcare_access", label: "Healthcare Access", color: "#9c27b0" },
    { value: "youth_development", label: "Youth Development", color: "#00bcd4" },
  ];

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

  const handleImpactChange = (index, value) => {
    const newInputs = [...impactInputs];
    newInputs[index] = value;
    setImpactInputs(newInputs);
  };

  const addImpactInput = () => {
    setImpactInputs((prev) => [...prev, ""]);
  };

  const removeImpactInput = (index) => {
    if (impactInputs.length > 1) {
      setImpactInputs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async () => {
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

      // Collect non-empty impacts
      const impacts = impactInputs.filter(imp => imp && imp.trim());
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", categoryForm.title);
      formData.append("description", categoryForm.description);
      formData.append("category", categoryForm.category);
      if (impacts.length > 0) {
        // Send impacts as JSON string array
        formData.append("impact", JSON.stringify(impacts));
      }
      
      // Append multiple images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/mission-categories", {
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
          text: "Mission category created successfully!",
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate("/mission-categories");
      } else {
        throw new Error(result.message || "Failed to create mission category");
      }
    } catch (error) {
      console.error("Error creating mission category:", error);
      setError(error.message || "Failed to create mission category");
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to create mission category",
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
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
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
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <IconButton
              onClick={() => navigate("/mission-categories")}
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
            <MissionIcon sx={{ fontSize: 40 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                fontSize: { xs: "1.3rem", sm: "1.6rem", md: "1.8rem" },
                whiteSpace: "nowrap",
              }}
            >
              Create New Mission Category
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
                  <MissionIcon sx={{ color: "#667eea" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Basic Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
              {/* Title */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  multiline
                  rows={4}
                  value={categoryForm.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
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
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Impacts (List multiple key impacts)
                  </Typography>
                  {impactInputs.map((impact, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        label={`Impact ${index + 1}`}
                        value={impact}
                        onChange={(e) => handleImpactChange(index, e.target.value)}
                        placeholder="e.g., Over 200 students received scholarship support"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "transparent",
                          },
                        }}
                      />
                      {impactInputs.length > 1 && (
                        <IconButton
                          onClick={() => removeImpactInput(index)}
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button
                    onClick={addImpactInput}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    + Add Another Impact
                  </Button>
                </Box>
              </Grid>
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
                    Category Image
                  </Typography>
                </Box>
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

                {/* Selected Images Preview */}
                {imagePreviews.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" mb={2}>
                      Selected Images ({imagePreviews.length}):
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

                {imagePreviews.length === 0 && (
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
                      No images selected. Click "Upload Images" to add images.
                    </Typography>
                  </Box>
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
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <MissionIcon sx={{ color: "#4facfe" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Actions
                  </Typography>
                </Box>
                <Box display="flex">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <Save />
                    }
                    onClick={handleCreate}
                    disabled={saving}
                    sx={{
                      flex: 1,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      },
                      "&:disabled": {
                        background: "#e0e0e0",
                        color: "#999",
                      },
                    }}
                  >
                    {saving ? "Creating..." : "Create Category"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/mission-categories")}
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

export default MissionCategoryCreate;

