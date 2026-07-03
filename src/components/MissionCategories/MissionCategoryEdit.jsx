import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Edit as EditIcon,
} from "@mui/icons-material";
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
        headers: { Authorization: `Bearer ${token}` },
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

        if (category.images && Array.isArray(category.images)) {
          const imageUrls = category.images.map((img) => {
            const path = typeof img === "object" ? img.path : img;
            return buildImageUrl(path);
          });
          setExistingImages(imageUrls);
        } else if (category.image) {
          setExistingImages([buildImageUrl(category.image)]);
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
          confirmButtonColor: brand.green,
        });
        return;
      }

      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const formData = new FormData();
      formData.append("title", categoryForm.title);
      formData.append("description", categoryForm.description);
      formData.append("category", categoryForm.category);
      if (categoryForm.impact) formData.append("impact", categoryForm.impact);

      existingImages.forEach((imageUrl) => {
        const path = imageUrl.replace(/^\/uploads\//, "uploads/").replace(/^\//, "");
        formData.append("existing_images", path);
      });

      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(`/api/mission-categories/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Mission category updated successfully!",
          icon: "success",
          confirmButtonColor: brand.green,
        });
        navigate(`/mission-categories/${id}`);
      } else {
        throw new Error(result.message || "Failed to update mission category");
      }
    } catch (err) {
      console.error("Error updating mission category:", err);
      setError(err.message || "Failed to update mission category");
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to update mission category",
        icon: "error",
        confirmButtonColor: brand.green,
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => categoryForm.title.trim() && categoryForm.description.trim();

  const renderImageCard = (src, label, onRemove, onClick) => (
    <Box
      sx={{
        p: 1.5,
        bgcolor: brand.sidebarBgAlt,
        borderRadius: 2,
        border: `1px solid ${brand.sidebarBorder}`,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s",
        "&:hover": onClick ? { transform: "scale(1.02)" } : undefined,
      }}
      onClick={onClick}
    >
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
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
        src={src}
        alt={label}
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
        {label}
      </Typography>
    </Box>
  );

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
              onClick={() => navigate(`/mission-categories/${id}`)}
              aria-label="Back to category"
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
                Edit Mission Category
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }} noWrap>
                {categoryForm.title}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

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
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
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
                <TextField
                  fullWidth
                  label="Impact"
                  value={categoryForm.impact}
                  onChange={(e) => handleInputChange("impact", e.target.value)}
                  helperText="e.g., High Impact"
                  sx={fieldSx}
                />
              </Stack>
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={ImageIcon} title="Category Images" color={brand.green} />
            <Box sx={{ p: 3 }}>
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

              {existingImages.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight={600} color={brand.navy} mb={2}>
                    Current Images ({existingImages.length})
                  </Typography>
                  <Box sx={imageGridSx(existingImages.length)}>
                    {existingImages.map((imageUrl, index) => {
                      const fileName = imageUrl.split("/").pop() || `Image ${index + 1}`;
                      return (
                        <Box key={`existing-${index}`}>
                          {renderImageCard(imageUrl, fileName, () => removeExistingImage(index))}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {imagePreviews.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight={600} color={brand.navy} mb={2}>
                    New Images ({imagePreviews.length})
                  </Typography>
                  <Box sx={imageGridSx(imagePreviews.length)}>
                    {imagePreviews.map((preview, index) => (
                      <Box key={`new-${index}`}>
                        {renderImageCard(
                          preview.preview,
                          preview.file.name,
                          () => removeSelectedImage(index)
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {existingImages.length === 0 && imagePreviews.length === 0 && (
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
                    No images. Click &quot;Upload Images&quot; to add photos.
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
                  onClick={handleUpdate}
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
                  onClick={() => navigate(`/mission-categories/${id}`)}
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

export default MissionCategoryEdit;
