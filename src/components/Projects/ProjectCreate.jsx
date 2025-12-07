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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  VolunteerActivism,
  Save,
  ArrowBack,
  People,
  LocationOn,
  Event,
  CloudUpload,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import LocationMapPicker from "./LocationMapPicker";

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    category: "volunteer",
    county: "",
    subcounty: "",
    target_individual: "",
    start_date: "",
    end_date: "",
    latitude: "",
    longitude: "",
  });

  const categoryOptions = [
    { value: "volunteer", label: "Volunteer Program", color: "#2196f3" },
    { value: "education", label: "Education", color: "#ff9800" },
    { value: "mental_health", label: "Mental Health", color: "#9c27b0" },
    { value: "community", label: "Community Development", color: "#4caf50" },
    { value: "donation", label: "Donation Drive", color: "#f44336" },
    { value: "partnership", label: "Partnership", color: "#00bcd4" },
  ];

  const handleInputChange = (field, value) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event) => {
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
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: `${file.name} is not an image file`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      
      // Create previews for new files
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => [
            ...prev,
            { file, preview: reader.result, name: file.name },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset input to allow selecting the same file again
    event.target.value = "";
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all project form fields
      Object.keys(projectForm).forEach((key) => {
        if (projectForm[key] !== null && projectForm[key] !== undefined && projectForm[key] !== "") {
          formData.append(key, projectForm[key]);
        }
      });
      
      // Add image files
      selectedFiles.forEach((file) => {
        formData.append("update_images", file);
      });

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Clear selected files after successful creation
        setSelectedFiles([]);
        setFilePreviews([]);
        
        await Swal.fire({
          title: "Success!",
          text: "Project created successfully!",
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate("/projects");
      } else {
        throw new Error(result.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to create project",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      projectForm.name.trim() &&
      projectForm.description.trim() &&
      projectForm.category &&
      projectForm.county.trim()
    );
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
              onClick={() => navigate("/projects")}
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
            <VolunteerActivism sx={{ fontSize: 40 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Create New Project
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
                  <VolunteerActivism sx={{ color: "#667eea" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Basic Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12} sx={{ width: "100%", maxWidth: "100%" }}>
                    <TextField
                      fullWidth
                      label="Project Name"
                      value={projectForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
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
                      label="Description"
                      multiline
                      rows={4}
                      value={projectForm.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
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
                      <InputLabel>Project Category</InputLabel>
                      <Select
                        value={projectForm.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        label="Project Category"
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
                </Grid>
              </CardContent>
            </Card>

            {/* Location Information */}
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
                  <LocationOn sx={{ color: "#f093fb" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Location Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  {/* Map Picker for Location - Includes County and Subcounty Selection */}
                  <Grid item xs={12}>
                    <LocationMapPicker
                      county={projectForm.county}
                      subcounty={projectForm.subcounty}
                      latitude={projectForm.latitude}
                      longitude={projectForm.longitude}
                      onCountyChange={(value) => handleInputChange("county", value)}
                      onSubcountyChange={(value) => handleInputChange("subcounty", value)}
                      onLocationChange={(lat, lng) => {
                        handleInputChange("latitude", lat);
                        handleInputChange("longitude", lng);
                      }}
                    />
                  </Grid>

                  {/* Display coordinates (read-only) */}
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Latitude"
                        type="number"
                        value={projectForm.latitude}
                        onChange={(e) =>
                          handleInputChange("latitude", e.target.value)
                        }
                        placeholder="Click on map to set"
                        InputProps={{
                          readOnly: false,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "transparent",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        type="number"
                        value={projectForm.longitude}
                        onChange={(e) =>
                          handleInputChange("longitude", e.target.value)
                        }
                        placeholder="Click on map to set"
                        InputProps={{
                          readOnly: false,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "transparent",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Target Audience */}
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
                  <People sx={{ color: "#4facfe" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Target Audience
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target Individual/Group"
                      value={projectForm.target_individual}
                      onChange={(e) =>
                        handleInputChange("target_individual", e.target.value)
                      }
                      placeholder="e.g., Youth, Women, Elderly, Students"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Timeline */}
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
                  <Event sx={{ color: "#43e97b" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Timeline
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
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
                      type="date"
                      value={projectForm.end_date}
                      onChange={(e) =>
                        handleInputChange("end_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Project Images */}
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
                    Project Images
                  </Typography>
                </Box>

                {/* Image Upload */}
                <Box mb={3}>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    id="file-upload"
                    accept="image/*"
                  />
                  <label htmlFor="file-upload">
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
                        mb: 2,
                      }}
                    >
                      Upload Images
                    </Button>
                  </label>
                </Box>

                {/* Selected Images Preview */}
                {filePreviews.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" mb={2}>
                      Selected Images ({filePreviews.length}):
                    </Typography>
                    <Grid container spacing={2}>
                      {filePreviews.map((preview, index) => (
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
                              onClick={() => removeSelectedFile(index)}
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
                              alt={preview.name}
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
                              {preview.name}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {filePreviews.length === 0 && (
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

            {/* Action Buttons */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
              }}
            >
              <CardContent>
                <Box display="flex">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <Save />
                    }
                    onClick={handleCreate}
                    disabled={!isFormValid() || saving}
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
                    {saving ? "Creating..." : "Create Project"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/projects")}
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

export default ProjectCreate;
