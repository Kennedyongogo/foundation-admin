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
  Article as NewsIcon,
  Event as EventIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Schedule,
  LocationOn,
  Person,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { brand } from "../../brandColors";
import {
  sectionCardSx,
  SectionHeader,
  outerPaperSx,
  pageHeaderSx,
  dateGridSx,
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

const getStatusStyle = (status, type) => {
  const newsStyles = {
    draft: { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, label: "Draft" },
    published: { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Published" },
    archived: { bg: alpha("#757575", 0.12), color: "#616161", label: "Archived" },
  };
  const eventStyles = {
    upcoming: { bg: alpha(brand.blue, 0.12), color: brand.blue, label: "Upcoming" },
    ongoing: { bg: alpha(brand.gold, 0.18), color: "#e65100", label: "Ongoing" },
    completed: { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Completed" },
    cancelled: { bg: alpha("#c62828", 0.1), color: "#c62828", label: "Cancelled" },
  };
  const styles = type === "news" ? newsStyles : eventStyles;
  return styles[status] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, label: status };
};

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setPost(result.data);
      } else {
        setError(result.message || "Failed to fetch post details");
      }
    } catch (err) {
      setError("Failed to fetch post details");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress sx={{ color: brand.green }} size={48} />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Post not found"}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/posts")}
          sx={{ color: brand.navy, borderColor: brand.sidebarBorder }}
        >
          Back to Posts
        </Button>
      </Box>
    );
  }

  const statusStyle = getStatusStyle(post.status, post.type);
  const TypeIcon = post.type === "news" ? NewsIcon : EventIcon;
  const imageItems =
    post.type === "news" && post.images?.length
      ? post.images.map((img, i) => {
          const path = typeof img === "object" ? img.path : img;
          return { key: i, src: buildImageUrl(path), alt: `${post.title} - ${i + 1}` };
        })
      : post.type === "event" && post.banner
        ? [{ key: "banner", src: buildImageUrl(post.banner), alt: `${post.title} - Banner` }]
        : [];

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
                  flexShrink: 0,
                }}
              >
                <TypeIcon sx={{ fontSize: 26, color: brand.gold }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, lineHeight: 1.2 }}
                >
                  {post.title}
                </Typography>
                <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={post.type === "news" ? "News" : "Event"}
                    size="small"
                    sx={{
                      bgcolor: alpha(brand.gold, 0.2),
                      color: "#fff",
                      fontWeight: 600,
                      border: `1px solid ${alpha(brand.gold, 0.4)}`,
                    }}
                  />
                  <Chip
                    label={statusStyle.label}
                    size="small"
                    sx={{
                      bgcolor: alpha("#fff", 0.15),
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/posts/${id}/edit`)}
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
              Edit Post
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={DescriptionIcon} title="Basic Information" />
            <Box sx={{ p: 3 }}>
              <Box sx={dateGridSx}>
                <DetailCell label="Type">
                  <Typography variant="body1" fontWeight={600} color={brand.navy}>
                    {post.type === "news" ? "News" : "Event"}
                  </Typography>
                </DetailCell>
                <DetailCell label="Status">
                  <Chip
                    label={statusStyle.label}
                    size="small"
                    sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }}
                  />
                </DetailCell>
              </Box>
              <Box sx={{ mt: 2.5 }}>
                <DetailCell label="Content">
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: brand.navy }}>
                    {post.content}
                  </Typography>
                </DetailCell>
              </Box>
              {post.type === "event" && (
                <Box sx={{ ...dateGridSx, mt: 2.5 }}>
                  {post.start_date && (
                    <DetailCell label="Start Date">
                      <Typography variant="body1" fontWeight={600} color={brand.navy}>
                        {new Date(post.start_date).toLocaleString()}
                      </Typography>
                    </DetailCell>
                  )}
                  {post.end_date && (
                    <DetailCell label="End Date">
                      <Typography variant="body1" fontWeight={600} color={brand.navy}>
                        {new Date(post.end_date).toLocaleString()}
                      </Typography>
                    </DetailCell>
                  )}
                  {post.location && (
                    <DetailCell label="Location">
                      <Box display="flex" alignItems="center" gap={0.75}>
                        <LocationOn sx={{ color: brand.green, fontSize: 18 }} />
                        <Typography variant="body1" fontWeight={600} color={brand.navy}>
                          {post.location}
                        </Typography>
                      </Box>
                    </DetailCell>
                  )}
                </Box>
              )}
            </Box>
          </Paper>

          {imageItems.length > 0 && (
            <Paper elevation={0} sx={sectionCardSx}>
              <SectionHeader
                icon={ImageIcon}
                title={post.type === "news" ? "Images" : "Banner"}
                color={brand.blue}
              />
              <Box sx={{ p: 3 }}>
                <ImageGridRows
                  items={imageItems}
                  renderItem={(item) => (
                    <Box
                      key={item.key}
                      component="img"
                      src={item.src}
                      alt={item.alt}
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: `1px solid ${brand.sidebarBorder}`,
                      }}
                    />
                  )}
                />
              </Box>
            </Paper>
          )}

          <Paper elevation={0} sx={{ ...sectionCardSx, mb: 0 }}>
            <SectionHeader icon={Schedule} title="Additional Details" color={brand.navy} />
            <Box sx={{ p: 3 }}>
              <Box sx={dateGridSx}>
                {post.creator && (
                  <DetailCell label="Created By">
                    <Box display="flex" alignItems="center" gap={0.75}>
                      <Person sx={{ color: brand.green, fontSize: 18 }} />
                      <Typography variant="body1" fontWeight={600} color={brand.navy}>
                        {post.creator.full_name || post.creator.email}
                      </Typography>
                    </Box>
                  </DetailCell>
                )}
                <DetailCell label="Created At">
                  <Typography variant="body1" fontWeight={600} color={brand.navy}>
                    {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </DetailCell>
                <DetailCell label="Updated At">
                  <Typography variant="body1" fontWeight={600} color={brand.navy}>
                    {new Date(post.updatedAt).toLocaleString()}
                  </Typography>
                </DetailCell>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default PostView;
