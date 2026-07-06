import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
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
  Add,
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
  dateGridSx,
} from "../Projects/projectFormUi";
import { saveButtonSx, cancelButtonSx } from "../Util/adminListUi";

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
          confirmButtonColor: brand.green,
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
        confirmButtonColor: brand.green,
      });
    } finally {
      setSaving(false);
    }
  };

  const TypeIcon = postForm.type === "news" ? NewsIcon : EventIcon;

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
              onClick={() => navigate("/posts")}
              aria-label="Back to posts"
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
              <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, lineHeight: 1.2 }}>
                Create New {postForm.type === "news" ? "News" : "Event"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }}>
                Add news or event content for the public portal
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
            <SectionHeader icon={TypeIcon} title="Basic Information" />
            <Box sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <FormControl fullWidth required sx={fieldSx}>
                  <InputLabel id="type-label" shrink={!!postForm.type}>Post Type</InputLabel>
                  <Select
                    labelId="type-label"
                    value={postForm.type || ""}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    label="Post Type"
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

                <FormControl fullWidth required sx={fieldSx}>
                  <InputLabel id="status-label" shrink={!!postForm.status}>Status</InputLabel>
                  <Select
                    key={`status-${postForm.type}`}
                    labelId="status-label"
                    value={postForm.status || ""}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    label="Status"
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
                </FormControl>

                <TextField
                  fullWidth
                  label="Title"
                  value={postForm.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  sx={fieldSx}
                />

                <TextField
                  fullWidth
                  label="Content"
                  multiline
                  rows={4}
                  value={postForm.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  required
                  sx={fieldSx}
                />

                {postForm.type === "event" && (
                  <Box sx={dateGridSx}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="datetime-local"
                      value={postForm.start_date}
                      onChange={(e) => handleInputChange("start_date", e.target.value)}
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />
                    <TextField
                      fullWidth
                      label="End Date"
                      type="datetime-local"
                      value={postForm.end_date}
                      onChange={(e) => handleInputChange("end_date", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />
                    <TextField
                      fullWidth
                      label="Location"
                      value={postForm.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      sx={{ ...fieldSx, gridColumn: "1 / -1" }}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={ImageIcon} title={postForm.type === "news" ? "Images" : "Banner"} color={brand.blue} />
            <Box sx={{ p: 3 }}>
              {postForm.type === "news" ? (
                <>
                  <input accept="image/*" style={{ display: "none" }} id="images-upload" type="file" multiple onChange={handleImageSelect} />
                  <label htmlFor="images-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      sx={{ color: brand.green, borderColor: brand.green, mb: 2, "&:hover": { bgcolor: alpha(brand.green, 0.08) } }}
                    >
                      Upload Images
                    </Button>
                  </label>
                  {imagePreviews.length > 0 ? (
                    <Grid container spacing={2}>
                      {imagePreviews.map((preview, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${brand.sidebarBorder}`, position: "relative", bgcolor: brand.sidebarBgAlt }}>
                            <IconButton
                              onClick={() => removeSelectedImage(index)}
                              size="small"
                              sx={{ position: "absolute", top: 8, right: 8, bgcolor: alpha("#000", 0.5), color: "#fff", zIndex: 2 }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                            <img src={preview.preview} alt={preview.file.name} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8 }} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ border: `2px dashed ${brand.sidebarBorder}`, borderRadius: 2, p: 4, textAlign: "center", bgcolor: brand.sidebarBgAlt }}>
                      <ImageIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2) }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No images selected yet.</Typography>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <input accept="image/*" style={{ display: "none" }} id="banner-upload" type="file" onChange={handleBannerSelect} />
                  <label htmlFor="banner-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      sx={{ color: brand.green, borderColor: brand.green, mb: 2, "&:hover": { bgcolor: alpha(brand.green, 0.08) } }}
                    >
                      Upload Banner
                    </Button>
                  </label>
                  {bannerPreview ? (
                    <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${brand.sidebarBorder}`, position: "relative", bgcolor: brand.sidebarBgAlt }}>
                      <IconButton
                        onClick={removeBanner}
                        size="small"
                        sx={{ position: "absolute", top: 8, right: 8, bgcolor: alpha("#000", 0.5), color: "#fff", zIndex: 2 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                      <img src={bannerPreview} alt="Banner preview" style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8 }} />
                    </Box>
                  ) : (
                    <Box sx={{ border: `2px dashed ${brand.sidebarBorder}`, borderRadius: 2, p: 4, textAlign: "center", bgcolor: brand.sidebarBgAlt }}>
                      <ImageIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2) }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No banner selected yet.</Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ ...sectionCardSx, mb: 0, position: { md: "sticky" }, bottom: 16, zIndex: 10 }}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleCreate}
                  disabled={saving}
                  sx={saveButtonSx}
                >
                  {saving ? "Creating…" : "Create Post"}
                </Button>
                <Button variant="outlined" size="large" fullWidth onClick={() => navigate("/posts")} sx={cancelButtonSx}>
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

export default PostCreate;

