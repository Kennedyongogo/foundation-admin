import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  CloudUpload,
  Close as CloseIcon,
  Image as ImageIcon,
  VolunteerActivism,
  LocationOn,
  Event,
  People,
  Edit as EditIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import { brand } from "../../brandColors";
import {
  fieldSx,
  sectionCardSx,
  SectionHeader,
  categoryOptions,
  outerPaperSx,
  pageHeaderSx,
  dateGridSx,
} from "./projectFormUi";

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
        confirmButtonColor: brand.green,
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress sx={{ color: brand.green }} size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/projects")}
          sx={{ color: brand.navy, borderColor: brand.sidebarBorder }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Project not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/projects")}
          sx={{ color: brand.navy, borderColor: brand.sidebarBorder }}
        >
          Back to Projects
        </Button>
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
              width: 140,
              height: 140,
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.06),
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <IconButton
              onClick={() => navigate(`/projects/${id}`)}
              aria-label="Back to project"
              sx={{
                bgcolor: alpha("#fff", 0.12),
                color: "#fff",
                border: `1px solid ${alpha("#fff", 0.2)}`,
                "&:hover": { bgcolor: alpha(brand.gold, 0.25) },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha("#fff", 0.12),
                border: `1px solid ${alpha(brand.gold, 0.45)}`,
              }}
            >
              <EditIcon sx={{ fontSize: 26, color: brand.gold }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, lineHeight: 1.2 }}
              >
                Edit Project
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }} noWrap>
                {project.name}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={VolunteerActivism} title="Basic Information" />
            <Box sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={projectForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  sx={fieldSx}
                />
                <FormControl fullWidth required sx={fieldSx}>
                  <InputLabel>Project Category</InputLabel>
                  <Select
                    value={projectForm.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    label="Project Category"
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: option.color,
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
                  multiline
                  rows={4}
                  label="Description"
                  value={projectForm.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  sx={fieldSx}
                />
                <Box sx={dateGridSx}>
                  <FormControl fullWidth required sx={fieldSx}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={projectForm.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
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
                      handleInputChange("progress", parseInt(e.target.value, 10) || 0)
                    }
                    inputProps={{ min: 0, max: 100 }}
                    sx={fieldSx}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Progress Update Description (Optional)"
                  value={progressDescription}
                  onChange={(e) => setProgressDescription(e.target.value)}
                  placeholder="Describe what progress was made..."
                  helperText="Add a note about this update (will be saved with timestamp)"
                  sx={fieldSx}
                />
              </Stack>
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={LocationOn} title="Location Information" color={brand.blue} />
            <Box sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box sx={dateGridSx}>
                  <TextField
                    fullWidth
                    label="County"
                    value={projectForm.county}
                    onChange={(e) => handleInputChange("county", e.target.value)}
                    required
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Subcounty"
                    value={projectForm.subcounty}
                    onChange={(e) => handleInputChange("subcounty", e.target.value)}
                    sx={fieldSx}
                  />
                </Box>
                <Box sx={dateGridSx}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={projectForm.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    inputProps={{ step: "any" }}
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={projectForm.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    inputProps={{ step: "any" }}
                    sx={fieldSx}
                  />
                </Box>
              </Stack>
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={Event} title="Timeline" color={brand.gold} />
            <Box sx={{ p: 3, width: "100%" }}>
              <Box sx={dateGridSx}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={projectForm.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={projectForm.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={People} title="Target & Assignment" color={brand.navy} />
            <Box sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Target Individual / Group"
                  value={projectForm.target_individual}
                  onChange={(e) => handleInputChange("target_individual", e.target.value)}
                  placeholder="e.g. Youth aged 18-25, Women farmers, etc."
                  sx={fieldSx}
                />
                <FormControl fullWidth sx={fieldSx}>
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
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={ImageIcon} title="Project Images" color={brand.green} />
            <Box sx={{ p: 3 }}>
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
                    mb: 2,
                    color: brand.green,
                    borderColor: brand.green,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: brand.greenDark,
                      bgcolor: alpha(brand.green, 0.08),
                    },
                  }}
                >
                  Upload Images
                </Button>
              </label>

              {selectedFiles.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight={600} color={brand.navy} mb={2}>
                    Selected Images ({selectedFiles.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedFiles.map((file, index) => {
                      const preview = filePreviews.find((p) => p.file === file);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: brand.sidebarBgAlt,
                              borderRadius: 2,
                              border: `1px solid ${brand.sidebarBorder}`,
                              position: "relative",
                            }}
                          >
                            <IconButton
                              onClick={() => removeSelectedFile(index)}
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                bgcolor: alpha("#000", 0.55),
                                color: "#fff",
                                "&:hover": { bgcolor: "#c62828" },
                                zIndex: 2,
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                            {preview?.preview ? (
                              <Box>
                                <Box
                                  component="img"
                                  src={preview.preview}
                                  alt={file.name}
                                  sx={{
                                    width: "100%",
                                    height: 150,
                                    objectFit: "cover",
                                    borderRadius: 1.5,
                                    mb: 1,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color={brand.sidebarTextMuted}
                                  display="block"
                                  textAlign="center"
                                  sx={{ wordBreak: "break-word" }}
                                >
                                  {file.name}
                                </Typography>
                              </Box>
                            ) : (
                              <Box textAlign="center">
                                <ImageIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.3), mb: 1 }} />
                                <Typography variant="caption" color={brand.sidebarTextMuted}>
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

              {uploadingFiles && (
                <Box mb={2}>
                  <Typography variant="body2" mb={1}>
                    Uploading files...
                  </Typography>
                  <LinearProgress sx={{ borderRadius: 1 }} />
                </Box>
              )}

              {projectImages.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color={brand.navy} mb={2}>
                    Current Images ({projectImages.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {projectImages.map((fileUrl, index) => {
                      const fileName = fileUrl.split("/").pop() || `Image ${index + 1}`;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: brand.sidebarBgAlt,
                              borderRadius: 2,
                              border: `1px solid ${brand.sidebarBorder}`,
                              position: "relative",
                              cursor: "pointer",
                              transition: "transform 0.2s",
                              "&:hover": { transform: "scale(1.02)" },
                            }}
                            onClick={() => handleImageClick(fileUrl, fileName)}
                          >
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                removeProjectImage(index);
                              }}
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                bgcolor: alpha("#000", 0.55),
                                color: "#fff",
                                "&:hover": { bgcolor: "#c62828" },
                                zIndex: 2,
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                            <Box
                              component="img"
                              src={buildImageUrl(fileUrl)}
                              alt={fileName}
                              sx={{
                                width: "100%",
                                height: 150,
                                objectFit: "cover",
                                borderRadius: 1.5,
                                mb: 1,
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <Typography
                              variant="caption"
                              color={brand.sidebarTextMuted}
                              display="block"
                              textAlign="center"
                              sx={{ wordBreak: "break-word" }}
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
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{ ...sectionCardSx, mb: 0, position: { md: "sticky" }, bottom: 16, zIndex: 10 }}
          >
            <Box sx={{ p: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleSave}
                  disabled={!isFormValid() || saving}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 2,
                    bgcolor: brand.green,
                    boxShadow: `0 6px 20px ${alpha(brand.green, 0.4)}`,
                    "&:hover": {
                      bgcolor: brand.greenLight,
                      boxShadow: `0 8px 24px ${alpha(brand.green, 0.45)}`,
                    },
                    "&:disabled": { bgcolor: "#e0e0e0", color: "#9e9e9e", boxShadow: "none" },
                  }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => navigate(`/projects/${id}`)}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    color: brand.navy,
                    borderColor: brand.sidebarBorder,
                    "&:hover": {
                      borderColor: brand.navy,
                      bgcolor: alpha(brand.navy, 0.04),
                    },
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Paper>

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
