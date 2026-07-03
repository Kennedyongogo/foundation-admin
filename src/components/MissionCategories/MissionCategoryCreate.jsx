import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
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
  Add,
  TrackChanges,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import { brand } from "../../brandColors";
import {
  fieldSx,
  sectionCardSx,
  SectionHeader,
  outerPaperSx,
  pageHeaderSx,
  missionCategoryOptions,
  imageGridSx,
} from "../Projects/projectFormUi";

const MissionCategoryCreate = () => {
  const navigate = useNavigate();
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

  const handleInputChange = (field, value) => {
    setCategoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event) => {
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
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, { file, preview: reader.result }]);
        };
        reader.readAsDataURL(file);
      });
    }
    event.target.value = "";
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
          confirmButtonColor: brand.green,
        });
        return;
      }

      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const impacts = impactInputs.filter((imp) => imp && imp.trim());
      const formData = new FormData();
      formData.append("title", categoryForm.title);
      formData.append("description", categoryForm.description);
      formData.append("category", categoryForm.category);
      if (impacts.length > 0) {
        formData.append("impact", JSON.stringify(impacts));
      }
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/mission-categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Mission category created successfully!",
          icon: "success",
          confirmButtonColor: brand.green,
        });
        navigate("/mission-categories");
      } else {
        throw new Error(result.message || "Failed to create mission category");
      }
    } catch (err) {
      console.error("Error creating mission category:", err);
      setError(err.message || "Failed to create mission category");
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to create mission category",
        icon: "error",
        confirmButtonColor: brand.green,
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => categoryForm.title.trim() && categoryForm.description.trim();

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
          <Stack direction="row" alignItems="center" spacing={2} sx={{ position: "relative", zIndex: 1 }}>
            <IconButton
              onClick={() => navigate("/mission-categories")}
              aria-label="Back to mission categories"
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
                Create Mission Category
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }}>
                Add a new category for the public mission section
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
          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={MissionIcon} title="Basic Information" />
            <Box sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Title"
                  value={categoryForm.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  placeholder="e.g. Youth Education Initiative"
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={categoryForm.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  sx={fieldSx}
                />
                <FormControl fullWidth required sx={fieldSx}>
                  <InputLabel>Category Type</InputLabel>
                  <Select
                    value={categoryForm.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    label="Category Type"
                  >
                    {missionCategoryOptions.map((option) => (
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

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={TrackChanges} title="Key Impacts" color={brand.gold} />
            <Box sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                {impactInputs.map((impact, index) => (
                  <Box key={index} sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      label={`Impact ${index + 1}`}
                      value={impact}
                      onChange={(e) => handleImpactChange(index, e.target.value)}
                      placeholder="e.g. Over 200 students received scholarship support"
                      sx={fieldSx}
                    />
                    {impactInputs.length > 1 && (
                      <IconButton
                        onClick={() => removeImpactInput(index)}
                        sx={{ mt: 0.5, color: "#c62828" }}
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
                  sx={{
                    alignSelf: "flex-start",
                    textTransform: "none",
                    color: brand.navy,
                    borderColor: brand.sidebarBorder,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  + Add Another Impact
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={ImageIcon} title="Category Images" color={brand.green} />
            <Box sx={{ p: 3 }}>
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

              {imagePreviews.length > 0 ? (
                <Box sx={imageGridSx(imagePreviews.length)}>
                  {imagePreviews.map((preview, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        bgcolor: brand.sidebarBgAlt,
                        borderRadius: 2,
                        border: `1px solid ${brand.sidebarBorder}`,
                        position: "relative",
                      }}
                    >
                      <IconButton
                        onClick={() => removeSelectedImage(index)}
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
                        alt={preview.file.name}
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
                        {preview.file.name}
                      </Typography>
                    </Box>
                  ))}
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
                  {saving ? "Creating…" : "Create Category"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => navigate("/mission-categories")}
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
    </Box>
  );
};

export default MissionCategoryCreate;
