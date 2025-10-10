import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Container,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  VolunteerActivism as ProjectIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Handshake as HandshakeIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as TaskIcon,
  CardGiftcard as GiftIcon,
  Favorite as HeartIcon,
  TrendingUp as ProgressIcon,
  Warning as IssueIcon,
  Notes as NotesIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as WordIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  CloudUpload as UploadIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

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

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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

  const formatCurrency = (amount, currency = "KES") => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(amount);
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

  const getFileIcon = (fileName) => {
    const type = getFileType(fileName);
    switch (type) {
      case "image":
        return <ImageIcon sx={{ fontSize: 48, color: "white", mb: 1 }} />;
      case "pdf":
        return <PdfIcon sx={{ fontSize: 48, color: "#f44336", mb: 1 }} />;
      case "word":
        return <WordIcon sx={{ fontSize: 48, color: "#2196f3", mb: 1 }} />;
      case "excel":
        return <WordIcon sx={{ fontSize: 48, color: "#4caf50", mb: 1 }} />;
      default:
        return <ImageIcon sx={{ fontSize: 48, color: "white", mb: 1 }} />;
    }
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
                onClick={() => navigate("/projects")}
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
                  {project.name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Project Details
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/projects/${id}/edit`)}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                Edit Project
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ProjectIcon sx={{ color: "#667eea" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      Basic Information
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ProjectIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Category
                        </Typography>
                        <Chip
                          label={project.category?.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{ 
                            mt: 0.5,
                            backgroundColor: "#667eea",
                            color: "white",
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ProjectIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Project Status
                        </Typography>
                        <Chip
                          label={project.status?.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(project.status)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Location
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {project.county}{project.subcounty ? `, ${project.subcounty}` : ''}
                          </Typography>
                          {project.latitude && project.longitude && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#999",
                                fontFamily: "monospace",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              Coordinates:{" "}
                              {parseFloat(project.latitude).toFixed(6)},{" "}
                              {parseFloat(project.longitude).toFixed(6)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {project.latitude && project.longitude && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LocationIcon />}
                          onClick={() => {
                            navigate(`/map`, {
                              state: {
                                centerCoordinates: [
                                  parseFloat(project.longitude),
                                  parseFloat(project.latitude),
                                ],
                              },
                            });
                          }}
                          sx={{
                            color: "#667eea",
                            borderColor: "#667eea",
                            "&:hover": {
                              borderColor: "#667eea",
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                            },
                          }}
                        >
                          View Location
                        </Button>
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PeopleIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Target Individual
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {project.target_individual || "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Start Date
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatDate(project.start_date)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          End Date
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatDate(project.end_date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Progress */}
            <Grid item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ProgressIcon sx={{ color: "#f093fb" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      Progress
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ProjectIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Progress
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {project.progress || 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Description */}
            {project.description && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <DescriptionIcon sx={{ color: "#4facfe" }} />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Description
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: "#333" }}>
                      {project.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Project Team */}
            <Grid item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <PeopleIcon sx={{ color: "#4facfe" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      Project Team
                    </Typography>
                  </Box>
                  <Stack spacing={3}>
                    {project.creator && (
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "#667eea" }}>
                          {project.creator.full_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Created By
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333", fontWeight: 600 }}>
                            {project.creator.full_name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <EmailIcon sx={{ fontSize: 14, color: "#666" }} />
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              {project.creator.email}
                            </Typography>
                          </Box>
                          {project.creator.phone && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <PhoneIcon sx={{ fontSize: 14, color: "#666" }} />
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                {project.creator.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}
                    {project.assigner && (
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "#764ba2" }}>
                          {project.assigner.full_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Assigned By
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333", fontWeight: 600 }}>
                            {project.assigner.full_name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <EmailIcon sx={{ fontSize: 14, color: "#666" }} />
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              {project.assigner.email}
                            </Typography>
                          </Box>
                          {project.assigner.phone && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <PhoneIcon sx={{ fontSize: 14, color: "#666" }} />
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                {project.assigner.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}
                    {project.assignee && (
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "#43e97b" }}>
                          {project.assignee.full_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Assigned To
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333", fontWeight: 600 }}>
                            {project.assignee.full_name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <EmailIcon sx={{ fontSize: 14, color: "#666" }} />
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              {project.assignee.email}
                            </Typography>
                          </Box>
                          {project.assignee.phone && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <PhoneIcon sx={{ fontSize: 14, color: "#666" }} />
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                {project.assignee.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}
                    {!project.assignee && (
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "#e0e0e0" }}>
                          <PeopleIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Assigned To
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#999", fontStyle: "italic" }}>
                            Not assigned yet
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Updated By */}
            {project.updated_by && project.updated_by.length > 0 && (
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <PeopleIcon sx={{ color: "#f093fb" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Update History ({project.updated_by.length})
                      </Typography>
                    </Box>
                    <Stack spacing={3}>
                      {project.updated_by.map((update, index) => (
                        <Box 
                          key={index}
                          sx={{
                            p: 2,
                            backgroundColor: "#f8f9fa",
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: "#667eea" }}>
                              {update.full_name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ color: "#333", fontWeight: 600 }}>
                                {update.full_name}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                <EmailIcon sx={{ fontSize: 14, color: "#666" }} />
                                <Typography variant="caption" sx={{ color: "#666" }}>
                                  {update.email}
                                </Typography>
                              </Box>
                              {update.phone && (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <PhoneIcon sx={{ fontSize: 14, color: "#666" }} />
                                  <Typography variant="caption" sx={{ color: "#666" }}>
                                    {update.phone}
                                  </Typography>
                                </Box>
                              )}
                              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                <CalendarIcon sx={{ fontSize: 14, color: "#666" }} />
                                <Typography variant="caption" sx={{ color: "#666" }}>
                                  {update.timestamp ? formatDate(update.timestamp) : "Legacy update"}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Timeline */}
            <Grid item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <TimeIcon sx={{ color: "#4facfe" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      Timeline
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Created At
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatDate(project.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Last Updated
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatDate(project.updatedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Update Images */}
            {project.update_images && project.update_images.length > 0 && (
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
                      <ImageIcon sx={{ color: "#ff6b6b" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Update Images ({project.update_images.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.update_images.map((imageObj, index) => {
                        const fullImageUrl = buildImageUrl(imageObj.path);
                        return (
                          <Grid item xs={12} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                                cursor: "pointer",
                                transition: "transform 0.2s ease-in-out",
                                height: "200px",
                                display: "flex",
                                flexDirection: "column",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              }}
                              onClick={() => window.open(fullImageUrl, "_blank")}
                            >
                              <img
                                src={fullImageUrl}
                                alt={`Update ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "140px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  marginBottom: "8px",
                                  flex: 1,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ 
                                  color: "#666", 
                                  display: "block",
                                  textAlign: "center",
                                  mt: "auto"
                                }}
                              >
                                {formatDate(imageObj.timestamp)}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Progress Descriptions */}
            {project.progress_descriptions && project.progress_descriptions.length > 0 && (
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <ProgressIcon sx={{ color: "#667eea" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Progress Updates ({project.progress_descriptions.length})
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      {project.progress_descriptions.map((update, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            backgroundColor: "#f8f9fa",
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                          >
                            {update.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#666" }}
                          >
                            {formatDate(update.timestamp)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
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

export default ProjectView;
