import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  VolunteerActivism,
  LocationOn,
  Event,
  Description as DescriptionIcon,
  TrendingUp as ProgressIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
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
} from "./projectFormUi";

const DetailCell = ({ label, children }) => (
  <Box>
    <Typography variant="body2" color={brand.sidebarTextMuted} fontWeight={500} mb={0.5}>
      {label}
    </Typography>
    {children}
  </Box>
);

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    url: "",
    fileName: "",
    type: "",
  });

  // Helper to build URL for uploaded assets using Vite proxy
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;

    // Use relative URLs - Vite proxy will handle routing to backend
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  useEffect(() => {
    fetchProject();
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      case "on_hold":
        return "error";
      default:
        return "default";
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.toLowerCase().split(".").pop();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
      return "image";
    } else if (extension === "pdf") {
      return "pdf";
    } else if (["doc", "docx"].includes(extension)) {
      return "word";
    } else if (["xls", "xlsx"].includes(extension)) {
      return "excel";
    }
    return "document";
  };

  const handleDocumentClick = (fileUrl, fileName) => {
    const fullUrl = buildImageUrl(fileUrl);
    const type = getFileType(fileName);

    if (type === "image") {
      setPreviewModal({
        open: true,
        url: fullUrl,
        fileName: fileName,
        type: type,
      });
    } else {
      // For other file types, open in new tab for download
      window.open(fullUrl, "_blank");
    }
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
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0, flex: 1 }}>
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
                  flexShrink: 0,
                }}
              >
                <VolunteerActivism sx={{ fontSize: 26, color: brand.gold }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, lineHeight: 1.2 }}
                  noWrap
                >
                  {project.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }}>
                  Project Details
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/projects/${id}/edit`)}
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
              Edit Project
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={VolunteerActivism} title="Basic Information" />
            <Box sx={{ p: 3 }}>
              <Box sx={dateGridSx}>
                <DetailCell label="Category">
                  <Chip
                    label={project.category?.replace("_", " ").toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: alpha(brand.navy, 0.1),
                      color: brand.navy,
                      fontWeight: 600,
                    }}
                  />
                </DetailCell>
                <DetailCell label="Status">
                  <Chip
                    label={project.status?.replace("_", " ").toUpperCase()}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </DetailCell>
              </Box>
              <Box sx={{ ...dateGridSx, mt: 2.5 }}>
                <DetailCell label="Target Individual">
                  <Typography variant="body1" color={brand.navy}>
                    {project.target_individual || "Not specified"}
                  </Typography>
                </DetailCell>
                <DetailCell label="Progress">
                  <Typography variant="body1" fontWeight={600} color={brand.green}>
                    {project.progress || 0}%
                  </Typography>
                </DetailCell>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={LocationOn} title="Location Information" color={brand.blue} />
            <Box sx={{ p: 3 }}>
              <Box sx={dateGridSx}>
                <DetailCell label="County">
                  <Typography variant="body1" color={brand.navy}>
                    {project.county || "N/A"}
                  </Typography>
                </DetailCell>
                <DetailCell label="Subcounty">
                  <Typography variant="body1" color={brand.navy}>
                    {project.subcounty || "N/A"}
                  </Typography>
                </DetailCell>
              </Box>
              {project.latitude && project.longitude && (
                <Box
                  sx={{
                    mt: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <DetailCell label="Coordinates">
                    <Typography
                      variant="body2"
                      sx={{ color: brand.sidebarTextMuted, fontFamily: "monospace" }}
                    >
                      {parseFloat(project.latitude).toFixed(6)},{" "}
                      {parseFloat(project.longitude).toFixed(6)}
                    </Typography>
                  </DetailCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LocationOn />}
                    onClick={() => {
                      navigate("/map", {
                        state: {
                          centerCoordinates: [
                            parseFloat(project.longitude),
                            parseFloat(project.latitude),
                          ],
                        },
                      });
                    }}
                    sx={{
                      color: brand.blue,
                      borderColor: brand.blue,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: brand.blue,
                        bgcolor: alpha(brand.blue, 0.08),
                      },
                    }}
                  >
                    View on Map
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={Event} title="Timeline" color={brand.gold} />
            <Box sx={{ p: 3, width: "100%" }}>
              <Box sx={dateGridSx}>
                <DetailCell label="Start Date">
                  <Typography variant="body1" color={brand.navy}>
                    {formatDate(project.start_date)}
                  </Typography>
                </DetailCell>
                <DetailCell label="End Date">
                  <Typography variant="body1" color={brand.navy}>
                    {formatDate(project.end_date)}
                  </Typography>
                </DetailCell>
              </Box>
              <Box sx={{ ...dateGridSx, mt: 2.5 }}>
                <DetailCell label="Created At">
                  <Typography variant="body1" color={brand.navy}>
                    {formatDate(project.createdAt)}
                  </Typography>
                </DetailCell>
                <DetailCell label="Last Updated">
                  <Typography variant="body1" color={brand.navy}>
                    {formatDate(project.updatedAt)}
                  </Typography>
                </DetailCell>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={ProgressIcon} title="Progress" color={brand.green} />
            <Box sx={{ p: 3 }}>
              <LinearProgress
                variant="determinate"
                value={project.progress || 0}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: brand.sidebarBgAlt,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    bgcolor: brand.green,
                  },
                }}
              />
              <Typography variant="body2" color={brand.sidebarTextMuted} sx={{ mt: 1 }}>
                {project.progress || 0}% complete
              </Typography>
            </Box>
          </Paper>

          {project.description && (
            <Paper elevation={0} sx={sectionCardSx}>
              <SectionHeader icon={DescriptionIcon} title="Description" color={brand.blue} />
              <Box sx={{ p: 3 }}>
                <Typography variant="body1" color={brand.navy} sx={{ lineHeight: 1.7 }}>
                  {project.description}
                </Typography>
              </Box>
            </Paper>
          )}

          <Paper elevation={0} sx={sectionCardSx}>
            <SectionHeader icon={PeopleIcon} title="Project Team" color={brand.navy} />
            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                {project.creator && (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: brand.navy }}>{project.creator.full_name?.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" color={brand.sidebarTextMuted}>
                        Created By
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color={brand.navy}>
                        {project.creator.full_name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: brand.sidebarTextMuted }} />
                        <Typography variant="caption" color={brand.sidebarTextMuted}>
                          {project.creator.email}
                        </Typography>
                      </Box>
                      {project.creator.phone && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PhoneIcon sx={{ fontSize: 14, color: brand.sidebarTextMuted }} />
                          <Typography variant="caption" color={brand.sidebarTextMuted}>
                            {project.creator.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
                {project.assigner && (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: brand.blue }}>{project.assigner.full_name?.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" color={brand.sidebarTextMuted}>
                        Assigned By
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color={brand.navy}>
                        {project.assigner.full_name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: brand.sidebarTextMuted }} />
                        <Typography variant="caption" color={brand.sidebarTextMuted}>
                          {project.assigner.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                {project.assignee ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: brand.green }}>{project.assignee.full_name?.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" color={brand.sidebarTextMuted}>
                        Assigned To
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color={brand.navy}>
                        {project.assignee.full_name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: brand.sidebarTextMuted }} />
                        <Typography variant="caption" color={brand.sidebarTextMuted}>
                          {project.assignee.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: brand.sidebarBorder }}>
                      <PeopleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color={brand.sidebarTextMuted}>
                        Assigned To
                      </Typography>
                      <Typography variant="body1" color={brand.sidebarTextMuted} fontStyle="italic">
                        Not assigned yet
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          </Paper>

          {project.updated_by && project.updated_by.length > 0 && (
            <Paper elevation={0} sx={sectionCardSx}>
              <SectionHeader
                icon={PeopleIcon}
                title={`Update History (${project.updated_by.length})`}
                color={brand.gold}
              />
              <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {project.updated_by.map((update, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        bgcolor: brand.sidebarBgAlt,
                        borderRadius: 2,
                        border: `1px solid ${brand.sidebarBorder}`,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: brand.navy }}>{update.full_name?.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600} color={brand.navy}>
                            {update.full_name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <EmailIcon sx={{ fontSize: 14, color: brand.sidebarTextMuted }} />
                            <Typography variant="caption" color={brand.sidebarTextMuted}>
                              {update.email}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color={brand.sidebarTextMuted} display="block" mt={0.5}>
                            {update.timestamp ? formatDate(update.timestamp) : "Legacy update"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>
          )}

          {project.update_images && project.update_images.length > 0 && (
            <Paper elevation={0} sx={sectionCardSx}>
              <SectionHeader
                icon={ImageIcon}
                title={`Update Images (${project.update_images.length})`}
                color={brand.green}
              />
              <Box sx={{ p: 3, width: "100%" }}>
                <ImageGridRows
                  items={project.update_images}
                  renderItem={(imageObj, index) => {
                    const fullImageUrl = buildImageUrl(imageObj.path);
                    return (
                      <Box
                        key={index}
                        sx={{
                          p: 1.5,
                          bgcolor: brand.sidebarBgAlt,
                          borderRadius: 2,
                          border: `1px solid ${brand.sidebarBorder}`,
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": { transform: "scale(1.02)" },
                        }}
                        onClick={() => handleDocumentClick(imageObj.path, `Update ${index + 1}`)}
                      >
                        <Box
                          component="img"
                          src={fullImageUrl}
                          alt={`Update ${index + 1}`}
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
                          {formatDate(imageObj.timestamp)}
                        </Typography>
                      </Box>
                    );
                  }}
                />
              </Box>
            </Paper>
          )}

          {project.progress_descriptions && project.progress_descriptions.length > 0 && (
            <Paper elevation={0} sx={{ ...sectionCardSx, mb: 0 }}>
              <SectionHeader
                icon={ProgressIcon}
                title={`Progress Updates (${project.progress_descriptions.length})`}
                color={brand.blue}
              />
              <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {project.progress_descriptions.map((update, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        bgcolor: brand.sidebarBgAlt,
                        borderRadius: 2,
                        border: `1px solid ${brand.sidebarBorder}`,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} color={brand.navy} mb={1}>
                        {update.description}
                      </Typography>
                      <Typography variant="caption" color={brand.sidebarTextMuted}>
                        {formatDate(update.timestamp)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>
          )}
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

export default ProjectView;
