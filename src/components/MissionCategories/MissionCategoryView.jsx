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
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Favorite as MissionIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

const MissionCategoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to build URL for uploaded assets
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const getCategoryLabel = (categoryType) => {
    const labels = {
      educational_support: "Educational Support",
      mental_health_awareness: "Mental Health Awareness",
      poverty_alleviation: "Poverty Alleviation",
      community_empowerment: "Community Empowerment",
      healthcare_access: "Healthcare Access",
      youth_development: "Youth Development",
    };
    return labels[categoryType] || categoryType;
  };

  const getCategoryColor = (categoryType) => {
    const colors = {
      educational_support: "#2196f3",
      mental_health_awareness: "#e91e63",
      poverty_alleviation: "#4caf50",
      community_empowerment: "#ff9800",
      healthcare_access: "#9c27b0",
      youth_development: "#00bcd4",
    };
    return colors[categoryType] || "#667eea";
  };

  const getFirstImage = (category) => {
    if (category.images && Array.isArray(category.images) && category.images.length > 0) {
      const firstImage = category.images[0];
      const path = typeof firstImage === 'object' ? firstImage.path : firstImage;
      return buildImageUrl(path);
    }
    return null;
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
          onClick={() => navigate("/mission-categories")}
        >
          Back to Mission Categories
        </Button>
      </Container>
    );
  }

  if (!category) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Mission category not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/mission-categories")}
        >
          Back to Mission Categories
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
                onClick={() => navigate("/mission-categories")}
                size="small"
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.75rem",
                  minHeight: "auto",
                  "& .MuiButton-startIcon": {
                    marginRight: 0.5,
                    "& > *:nth-of-type(1)": {
                      fontSize: "0.875rem",
                    },
                  },
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Back
              </Button>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.3rem" },
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {category.title}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/mission-categories/${id}/edit`)}
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                px: 1.5,
                py: 0.5,
                fontSize: "0.75rem",
                minHeight: "auto",
                "& .MuiButton-startIcon": {
                  marginRight: 0.5,
                  "& > *:nth-of-type(1)": {
                    fontSize: "0.875rem",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              Edit Category
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ width: "100%" }}>
            {/* Basic Information */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                width: "100%",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <MissionIcon sx={{ color: "#667eea" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Basic Information
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={getFirstImage(category)}
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: getCategoryColor(category.category),
                      }}
                    >
                      <MissionIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        Category Type
                      </Typography>
                      <Chip
                        label={getCategoryLabel(category.category)}
                        size="small"
                        sx={{
                          mt: 0.5,
                          backgroundColor: getCategoryColor(category.category),
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                  {category.impact && (
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Impact{Array.isArray(category.impact) && category.impact.length > 1 ? 's' : ''}
                      </Typography>
                      {Array.isArray(category.impact) && category.impact.length > 0 ? (
                        <Box component="ul" sx={{ pl: 3, mb: 0, mt: 0.5, "& li": { mb: 1, lineHeight: 1.7 } }}>
                          {category.impact.map((impactItem, index) => (
                            <Typography
                              key={index}
                              component="li"
                              variant="body1"
                              sx={{
                                color: "#333",
                                fontSize: "0.95rem",
                              }}
                            >
                              {impactItem}
                            </Typography>
                          ))}
                        </Box>
                      ) : (
                        <Chip
                          label={typeof category.impact === 'string' ? category.impact : 'N/A'}
                          size="small"
                          sx={{
                            mt: 0.5,
                            backgroundColor: "#667eea",
                            color: "white",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Description */}
            {category.description && (
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <MissionIcon sx={{ color: "#4facfe" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Description
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.8 }}>
                    {category.description}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Images */}
            {category.images && Array.isArray(category.images) && category.images.length > 0 && (
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ImageIcon sx={{ color: "#43e97b" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Category Images ({category.images.length})
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {category.images.map((imageObj, index) => {
                      const imagePath = typeof imageObj === 'object' ? imageObj.path : imageObj;
                      const fullImageUrl = buildImageUrl(imagePath);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
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
                              alt={`${category.title} - Image ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "150px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                marginBottom: "8px",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
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
                              Image {index + 1}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default MissionCategoryView;

