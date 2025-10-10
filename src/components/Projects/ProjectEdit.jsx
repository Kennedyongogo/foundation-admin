import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  AttachMoney as MoneyIcon,
  Handshake as HandshakeIcon,
  VolunteerActivism as ProjectIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Notes as NotesIcon,
  PictureAsPdf as PdfIcon,
  Description as WordIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Helper to build URL for uploaded assets using Vite proxy
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;

    // Use relative URLs - Vite proxy will handle routing to backend
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    category: "volunteer",
    county: "",
    subcounty: "",
    target_individual: "",
    latitude: "",
    longitude: "",
    status: "pending",
    start_date: "",
    end_date: "",
    progress: 0,
    assigned_to: null,
  });
  const [progressDescription, setProgressDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [projectImages, setProjectImages] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    url: "",
    fileName: "",
    type: "",
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchProject();
    fetchUsers();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProject(result.data);
        setProjectForm({
          name: result.data.name || "",
          description: result.data.description || "",
          category: result.data.category || "volunteer",
          county: result.data.county || "",
          subcounty: result.data.subcounty || "",
          target_individual: result.data.target_individual || "",
          latitude: result.data.latitude || "",
          longitude: result.data.longitude || "",
          status: result.data.status || "pending",
          start_date: result.data.start_date
            ? result.data.start_date.split("T")[0]
            : "",
          end_date: result.data.end_date
            ? result.data.end_date.split("T")[0]
            : "",
          progress: result.data.progress || 0,
          assigned_to: result.data.assigned_to || null,
        });
        // Load existing update_images
        const images = result.data.update_images?.map(img => img.path) || [];
        setProjectImages(images);
      } else {
        setError(result.message || "Failed to fetch project details");
      }
    } catch (err) {
      setError("Failed to fetch project details");
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setUsers(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);

    // Create image previews
    const newPreviews = [];
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            file: file,
            preview: e.target.result,
            name: file.name,
            type: "image",
            previewType: "image",
          });
          setFilePreviews((prev) => [...prev, ...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeProjectImage = (index) => {
    const newImages = projectImages.filter((_, i) => i !== index);
    setProjectImages(newImages);
  };

  const handleImageClick = (fileUrl, fileName) => {
    const fullUrl = buildImageUrl(fileUrl);
      setPreviewModal({
        open: true,
        url: fullUrl,
        fileName: fileName,
      type: "image",
      });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      console.log("💾 Starting save...");

      // Prepare form data for project update with document files
      const formData = new FormData();

      // Add all project form fields
      Object.keys(projectForm).forEach((key) => {
        if (projectForm[key] !== null && projectForm[key] !== undefined) {
          formData.append(key, projectForm[key]);
        }
      });

      // Add progress description if provided
      if (progressDescription.trim()) {
        formData.append("progress_description", progressDescription.trim());
      }

      // Add existing image URLs
      projectImages.forEach((url) => {
        formData.append("existing_images", url);
      });

      // Add new image files
      selectedFiles.forEach((file) => {
        formData.append("update_images", file);
      });

      console.log("Updated project data with files");

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Clear selected files and previews after successful save
        setSelectedFiles([]);
        setFilePreviews([]);
        setProgressDescription("");

        await Swal.fire({
          title: "Success!",
          text: "Project updated successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(`/projects/${id}`);
      } else {
        throw new Error(result.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update project",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      projectForm.name.trim() !== "" &&
      projectForm.county.trim() !== "" &&
      projectForm.start_date !== ""
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Project not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
      </Container>
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
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/projects/${id}`)}
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
                  }}
                >
                  Edit Project
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {project.name}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isFormValid() || saving}
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
                    <ProjectIcon sx={{ color: "#667eea" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Basic Information
                    </Typography>
                  </Box>
                  <Stack spacing={3}>
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
                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={projectForm.category}
                      onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        label="Category"
                      >
                        <MenuItem value="volunteer">Volunteer</MenuItem>
                        <MenuItem value="donation">Donation</MenuItem>
                        <MenuItem value="fundraising">Fundraising</MenuItem>
                        <MenuItem value="education">Education</MenuItem>
                        <MenuItem value="healthcare">Healthcare</MenuItem>
                        <MenuItem value="infrastructure">Infrastructure</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={projectForm.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                    <FormControl fullWidth required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={projectForm.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        label="Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="on_hold">On Hold</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Progress (%)"
                      type="number"
                      value={projectForm.progress}
                      onChange={(e) =>
                        handleInputChange(
                          "progress",
                          parseInt(e.target.value) || 0
                        )
                      }
                      inputProps={{ min: 0, max: 100 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Progress Update Description (Optional)"
                      value={progressDescription}
                      onChange={(e) => setProgressDescription(e.target.value)}
                      placeholder="Describe what progress was made..."
                      helperText="Add a note about this update (will be saved with timestamp)"
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

            {/* Location & Schedule */}
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
                    <LocationIcon sx={{ color: "#f093fb" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Location & Schedule
                    </Typography>
                  </Box>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="County"
                      value={projectForm.county}
                      onChange={(e) =>
                        handleInputChange("county", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Subcounty"
                      value={projectForm.subcounty}
                      onChange={(e) =>
                        handleInputChange("subcounty", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                      fullWidth
                          label="Latitude"
                          type="number"
                          value={projectForm.latitude}
                          onChange={(e) =>
                            handleInputChange("latitude", e.target.value)
                          }
                          inputProps={{ step: "any" }}
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
                          inputProps={{ step: "any" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
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
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Target & Assignment */}
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
                    <PeopleIcon sx={{ color: "#4facfe" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Target & Assignment
                    </Typography>
                  </Box>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Target Individual/Group"
                      value={projectForm.target_individual}
                      onChange={(e) =>
                        handleInputChange("target_individual", e.target.value)
                      }
                      placeholder="e.g., Youth aged 18-25, Women farmers, etc."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Assign To</InputLabel>
                      <Select
                        value={projectForm.assigned_to || ""}
                      onChange={(e) =>
                          handleInputChange("assigned_to", e.target.value || null)
                        }
                        label="Assign To"
                      >
                        <MenuItem value="">
                          <em>Not assigned</em>
                        </MenuItem>
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Project Images */}
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
                        startIcon={<UploadIcon />}
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

                  {/* Selected Images */}
                  {selectedFiles.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" mb={2}>
                        Selected Images:
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedFiles.map((file, index) => {
                          const preview = filePreviews.find(
                            (p) => p.file === file
                          );

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

                                {preview?.previewType === "image" &&
                                preview.preview ? (
                                  <Box>
                                    <img
                                      src={preview.preview}
                                      alt={file.name}
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
                                      {file.name}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Box textAlign="center">
                                    <ImageIcon sx={{ fontSize: 48, color: "#666", mb: 1 }} />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#333",
                                        display: "block",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {file.name}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}

                  {/* Upload Progress */}
                  {uploadingFiles && (
                    <Box mb={2}>
                      <Typography variant="body2" mb={1}>
                        Uploading files...
                      </Typography>
                      <LinearProgress
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "white",
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Existing Images */}
                  {projectImages.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" mb={2}>
                        Current Images:
                      </Typography>
                      <Grid container spacing={2}>
                        {projectImages.map((fileUrl, index) => {
                          const fileName =
                            fileUrl.split("/").pop() || `Image ${index + 1}`;

                          return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Box
                                sx={{
                                  p: 2,
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: 2,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  cursor: "pointer",
                                  transition: "transform 0.2s ease-in-out",
                                  "&:hover": {
                                    transform: "scale(1.02)",
                                  },
                                }}
                                onClick={() =>
                                  handleImageClick(fileUrl, fileName)
                                }
                              >
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeProjectImage(index);
                                  }}
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

                                  <Box>
                                    <img
                                      src={buildImageUrl(fileUrl)}
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
                                      e.target.nextSibling.style.display = "flex";
                                      }}
                                    />
                                    <Box
                                      textAlign="center"
                                    sx={{ display: "none", flexDirection: "column", alignItems: "center" }}
                                  >
                                    <ImageIcon sx={{ fontSize: 48, color: "#666", mb: 1 }} />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#333",
                                        display: "block",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {fileName}
                                    </Typography>
                                  </Box>
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
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Image Preview Modal (for images only) */}
      {previewModal.open && previewModal.type === "image" && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() =>
            setPreviewModal({ open: false, url: "", fileName: "", type: "" })
          }
        >
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              p: 2,
              maxWidth: "90%",
              maxHeight: "90%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">{previewModal.fileName}</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => window.open(previewModal.url, "_blank")}
                  sx={{ mr: 1 }}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setPreviewModal({
                      open: false,
                      url: "",
                      fileName: "",
                      type: "",
                    })
                  }
                >
                  Close
                </Button>
              </Box>
            </Box>

            <img
              src={previewModal.url}
              alt={previewModal.fileName}
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProjectEdit;
