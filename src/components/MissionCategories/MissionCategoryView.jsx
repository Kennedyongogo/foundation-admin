import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  Favorite as MissionIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  TrackChanges,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { brand } from "../../brandColors";
import {
  sectionCardSx,
  SectionHeader,
  outerPaperSx,
  pageHeaderSx,
  dateGridSx,
  getMissionCategoryLabel,
  getMissionCategoryColor,
  ImageGridRows,
} from "../Projects/projectFormUi";

const DetailCell = ({ label, children }) => (
  <Box>
    <Typography variant="body2" color={brand.sidebarTextMuted} fontWeight={500} mb={0.5}>
      {label}
    </Typography>
    {children}
  </Box>
);

const MissionCategoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewModal, setPreviewModal] = useState({ open: false, url: "", fileName: "" });

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

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

      if (response.ok && result.success) {
        setCategory(result.data);
      } else {
        setError(result.message || "Failed to fetch mission category details");
      }
    } catch (err) {
      setError("Failed to fetch mission category details");
      console.error("Error fetching mission category:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImages = (cat) => {
    let images = cat?.images;
    if (typeof images === "string") {
      try {
        images = JSON.parse(images);
      } catch {
        images = [];
      }
    }
    if (Array.isArray(images) && images.length > 0) {
      return images
        .map((img) => {
          const path = typeof img === "object" ? img.path : img;
          return buildImageUrl(path);
        })
        .filter(Boolean);
    }
    if (cat?.image) {
      return [buildImageUrl(cat.image)];
    }
    return [];
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
          onClick={() => navigate("/mission-categories")}
          sx={{ color: brand.navy, borderColor: brand.sidebarBorder }}
        >
          Back to Mission Categories
        </Button>
      </Box>
    );
  }

  if (!category) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Mission category not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/mission-categories")}
          sx={{ color: brand.navy, borderColor: brand.sidebarBorder }}
        >
          Back to Mission Categories
        </Button>
      </Box>
    );
  }

  const imageList = getCategoryImages(category);

  const imageCardSx = {
    p: 1.5,
    bgcolor: brand.sidebarBgAlt,
    borderRadius: 2,
    border: `1px solid ${brand.sidebarBorder}`,
    cursor: "pointer",
    transition: "transform 0.2s",
    "&:hover": { transform: "scale(1.02)" },
  };

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
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0, flex: 1 }}>
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
                  flexShrink: 0,
                }}
              >
                <MissionIcon sx={{ fontSize: 26, color: brand.gold }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, lineHeight: 1.2 }}
                  noWrap
                >
                  {category.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }}>
                  Mission Category Details
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/mission-categories/${id}/edit`)}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                bgcolor: alpha("#fff", 0.15),
                color: "#fff",
                border: `1px solid ${alpha("#fff", 0.3)}`,
                "&:hover": { bgcolor: alpha(brand.gold, 0.3) },
                flexShrink: 0,
              }}
            >
              Edit Category
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={MissionIcon} title="Basic Information" />
            <Box sx={{ p: 3 }}>
              <Box sx={dateGridSx}>
                <DetailCell label="Category Type">
                  <Chip
                    label={getMissionCategoryLabel(category.category)}
                    size="small"
                    sx={{
                      bgcolor: alpha(getMissionCategoryColor(category.category), 0.12),
                      color: getMissionCategoryColor(category.category),
                      fontWeight: 600,
                      border: `1px solid ${alpha(getMissionCategoryColor(category.category), 0.35)}`,
                    }}
                  />
                </DetailCell>
                <DetailCell label="Title">
                  <Typography variant="body1" fontWeight={600} color={brand.navy}>
                    {category.title}
                  </Typography>
                </DetailCell>
              </Box>
            </Box>
          </Paper>

          {category.description && (
            <Paper elevation={0} sx={sectionCardSx}>
              <SectionHeader icon={DescriptionIcon} title="Description" color={brand.blue} />
              <Box sx={{ p: 3 }}>
                <Typography variant="body1" color={brand.navy} sx={{ lineHeight: 1.7 }}>
                  {category.description}
                </Typography>
              </Box>
            </Paper>
          )}

          {category.impact && (
            <Paper elevation={0} sx={sectionCardSx}>
              <SectionHeader icon={TrackChanges} title="Impact" color={brand.gold} />
              <Box sx={{ p: 3 }}>
                {Array.isArray(category.impact) && category.impact.length > 0 ? (
                  <Box component="ul" sx={{ pl: 3, mb: 0, mt: 0, "& li": { mb: 1, lineHeight: 1.7 } }}>
                    {category.impact.map((impactItem, index) => (
                      <Typography
                        key={index}
                        component="li"
                        variant="body1"
                        color={brand.navy}
                      >
                        {impactItem}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Chip
                    label={typeof category.impact === "string" ? category.impact : "N/A"}
                    size="small"
                    sx={{
                      bgcolor: alpha(brand.navy, 0.1),
                      color: brand.navy,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            </Paper>
          )}

          {imageList.length > 0 && (
            <Paper elevation={0} sx={{ ...sectionCardSx, mb: 0 }}>
              <SectionHeader
                icon={ImageIcon}
                title={`Category Images (${imageList.length})`}
                color={brand.green}
              />
              <Box sx={{ p: 3, width: "100%" }}>
                <ImageGridRows
                  items={imageList}
                  renderItem={(fullImageUrl, index) => (
                    <Box
                      key={index}
                      sx={imageCardSx}
                      onClick={() =>
                        setPreviewModal({
                          open: true,
                          url: fullImageUrl,
                          fileName: `Image ${index + 1}`,
                        })
                      }
                    >
                      <Box
                        component="img"
                        src={fullImageUrl}
                        alt={`${category.title} - Image ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: 140,
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
                      >
                        Image {index + 1}
                      </Typography>
                    </Box>
                  )}
                />
              </Box>
            </Paper>
          )}
        </Box>
      </Paper>

      {previewModal.open && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setPreviewModal({ open: false, url: "", fileName: "" })}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
              p: 2,
              maxWidth: "90%",
              maxHeight: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{previewModal.fileName}</Typography>
              <Button
                variant="outlined"
                onClick={() => setPreviewModal({ open: false, url: "", fileName: "" })}
              >
                Close
              </Button>
            </Box>
            <Box
              component="img"
              src={previewModal.url}
              alt={previewModal.fileName}
              sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 1 }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MissionCategoryView;
