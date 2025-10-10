import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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

  const categoryOptions = [
    { value: "volunteer", label: "Volunteer Program", color: "#2196f3" },
    { value: "education", label: "Education", color: "#ff9800" },
    { value: "mental_health", label: "Mental Health", color: "#9c27b0" },
    { value: "community", label: "Community Development", color: "#4caf50" },
    { value: "donation", label: "Donation Drive", color: "#f44336" },
    { value: "partnership", label: "Partnership", color: "#00bcd4" },
  ];

  const handleInputChange = (field, value) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectForm),
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Project created successfully!",
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate("/projects");
      } else {
        throw new Error(result.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to create project",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      projectForm.name.trim() &&
      projectForm.description.trim() &&
      projectForm.category &&
      projectForm.county.trim()
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
            mb: 4,
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
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <VolunteerActivism sx={{ fontSize: 40 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Create New Project
            </Typography>
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 2, position: "relative", zIndex: 1 }}
            >
              {error}
            </Alert>
          )}
        </Box>

        <Grid container spacing={4} sx={{ width: "100%" }}>
          {/* Basic Information */}
          <Grid item xs={12} sx={{ width: "100%" }}>
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <VolunteerActivism sx={{ color: "#667eea" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Basic Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12} sx={{ width: "100%", maxWidth: "100%" }}>
                    <TextField
                      fullWidth
                      label="Project Name"
                      value={projectForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={projectForm.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel>Project Category</InputLabel>
                      <Select
                        value={projectForm.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        label="Project Category"
                      >
                        {categoryOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: option.color,
                                }}
                              />
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <LocationOn sx={{ color: "#f093fb" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Location Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="County"
                      value={projectForm.county}
                      onChange={(e) =>
                        handleInputChange("county", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Sub-County"
                      value={projectForm.subcounty}
                      onChange={(e) =>
                        handleInputChange("subcounty", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      type="number"
                      value={projectForm.latitude}
                      onChange={(e) =>
                        handleInputChange("latitude", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      type="number"
                      value={projectForm.longitude}
                      onChange={(e) =>
                        handleInputChange("longitude", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <People sx={{ color: "#4facfe" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Target Audience
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target Individual/Group"
                      value={projectForm.target_individual}
                      onChange={(e) =>
                        handleInputChange("target_individual", e.target.value)
                      }
                      placeholder="e.g., Youth, Women, Elderly, Students"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Event sx={{ color: "#43e97b" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Timeline
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={projectForm.end_date}
                      onChange={(e) =>
                        handleInputChange("end_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
              }}
            >
              <CardContent>
                <Box display="flex">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <Save />
                    }
                    onClick={handleCreate}
                    disabled={!isFormValid() || saving}
                    sx={{
                      flex: 1,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      },
                      "&:disabled": {
                        background: "#e0e0e0",
                        color: "#999",
                      },
                    }}
                  >
                    {saving ? "Creating..." : "Create Project"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/projects")}
                    sx={{
                      flex: 1,
                      color: "#667eea",
                      borderColor: "#667eea",
                      "&:hover": {
                        borderColor: "#667eea",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProjectCreate;
