import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
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
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import LocationMapPicker from "./LocationMapPicker";
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

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);
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

  const handleInputChange = (field, value) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File too large",
          text: `${file.name} is larger than 10MB`,
          confirmButtonColor: brand.green,
        });
        return false;
      }
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: `${file.name} is not an image file`,
          confirmButtonColor: brand.green,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
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
      const formData = new FormData();

      Object.keys(projectForm).forEach((key) => {
        if (projectForm[key] !== null && projectForm[key] !== undefined && projectForm[key] !== "") {
          formData.append(key, projectForm[key]);
        }
      });

      selectedFiles.forEach((file) => {
        formData.append("update_images", file);
      });

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSelectedFiles([]);
        setFilePreviews([]);
        await Swal.fire({
          title: "Success!",
          text: "Project created successfully!",
          icon: "success",
          confirmButtonColor: brand.green,
        });
        navigate("/projects");
      } else {
        throw new Error(result.message || "Failed to create project");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to create project",
        icon: "error",
        confirmButtonColor: brand.green,
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () =>
    projectForm.name.trim() &&
    projectForm.description.trim() &&
    projectForm.category &&
    projectForm.county.trim();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress sx={{ color: brand.green }} size={48} />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={outerPaperSx}>
        {/* Header */}
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
              onClick={() => navigate("/projects")}
              aria-label="Back to projects"
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
              <Add sx={{ fontSize: 26, color: brand.gold }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, lineHeight: 1.2 }}
              >
                Create New Project
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }}>
                Add a new foundation project or community program
              </Typography>
            </Box>
          </Stack>
          {error && (
            <Alert severity="error" sx={{ mt: 2, position: "relative", zIndex: 1 }}>
              {error}
            </Alert>
          )}
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Basic Information */}
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
                  placeholder="e.g. Youth Empowerment Program"
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={projectForm.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  placeholder="Describe the project goals, activities, and expected impact..."
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
              </Stack>
            </Box>
          </Paper>

          {/* Location */}
          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={LocationOn} title="Location Information" color={brand.blue} />
            <Box sx={{ p: 3 }}>
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
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={projectForm.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="Click on map to set"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={projectForm.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="Click on map to set"
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Target Audience */}
          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={People} title="Target Audience" color={brand.navy} />
            <Box sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Target Individual / Group"
                value={projectForm.target_individual}
                onChange={(e) => handleInputChange("target_individual", e.target.value)}
                placeholder="e.g. Youth, Women, Elderly, Students"
                sx={fieldSx}
              />
            </Box>
          </Paper>

          {/* Timeline */}
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

          {/* Images */}
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

              {filePreviews.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color={brand.navy}
                    mb={2}
                  >
                    Selected Images ({filePreviews.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {filePreviews.map((preview, index) => (
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
                          <Box
                            component="img"
                            src={preview.preview}
                            alt={preview.name}
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
                            {preview.name}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: `2px dashed ${brand.sidebarBorder}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    bgcolor: brand.sidebarBgAlt,
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2) }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No images selected. Click &quot;Upload Images&quot; to add photos.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Actions */}
          <Paper
            elevation={0}
            sx={{
              ...sectionCardSx,
              mb: 0,
              position: { md: "sticky" },
              bottom: 16,
              zIndex: 10,
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleCreate}
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
                  {saving ? "Creating…" : "Create Project"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => navigate("/projects")}
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
              {!isFormValid() && (
                <Typography
                  variant="caption"
                  display="block"
                  textAlign="center"
                  color="text.secondary"
                  sx={{ mt: 1.5 }}
                >
                  Fill in project name, description, category, and county to continue.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectCreate;
