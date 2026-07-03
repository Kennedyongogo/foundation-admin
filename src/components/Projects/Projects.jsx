import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
  Construction as ProjectIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  AttachMoney as MoneyIcon,
  Engineering as EngineerIcon,
} from "@mui/icons-material";
import { Tabs, Tab } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import { brand, appBarGradient } from "../../brandColors";

const getCategoryStyle = (category) => {
  const styles = {
    donation: { bg: alpha(brand.gold, 0.15), color: "#b8860b", border: alpha(brand.gold, 0.4) },
    community: { bg: alpha(brand.green, 0.12), color: brand.greenDark, border: alpha(brand.green, 0.35) },
    mental_health: { bg: alpha(brand.blue, 0.12), color: brand.blue, border: alpha(brand.blue, 0.35) },
    education: { bg: alpha(brand.navy, 0.1), color: brand.navy, border: alpha(brand.navy, 0.3) },
    volunteer: { bg: alpha(brand.greenLight, 0.15), color: brand.greenDark, border: alpha(brand.green, 0.3) },
  };
  return styles[category] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, border: brand.sidebarBorder };
};

const getStatusStyle = (status) => {
  const styles = {
    pending: { bg: alpha(brand.gold, 0.18), color: "#e65100", label: "Pending" },
    in_progress: { bg: alpha(brand.blue, 0.12), color: brand.blue, label: "In Progress" },
    completed: { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Completed" },
    on_hold: { bg: alpha("#c62828", 0.1), color: "#c62828", label: "On Hold" },
  };
  const s = styles[status] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, label: status };
  return s;
};

const Projects = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProjects, setTotalProjects] = useState(0);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    on_hold: 0,
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    location_name: "",
    latitude: "",
    longitude: "",
    status: "pending",
    start_date: "",
    end_date: "",
    budget_estimate: 0,
    actual_cost: 0,
    currency: "KES",
    contractor_name: "",
    client_name: "",
    funding_source: "",
    engineer_in_charge: "",
    progress_percent: 0,
    blueprint_url: "",
    notes: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Project status tabs configuration
  const statusTabs = [
    { label: "All Projects", value: "all", count: tabCounts.all },
    { label: "Pending", value: "pending", count: tabCounts.pending },
    {
      label: "In Progress",
      value: "in_progress",
      count: tabCounts.in_progress,
    },
    { label: "Completed", value: "completed", count: tabCounts.completed },
    { label: "On Hold", value: "on_hold", count: tabCounts.on_hold },
  ];

  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage, activeTab]);

  // Fetch all projects for tab counts on component mount
  useEffect(() => {
    fetchAllProjectsForCounts();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      const currentStatus = statusTabs[activeTab]?.value;
      if (currentStatus && currentStatus !== "all") {
        queryParams.append("status", currentStatus);
      }

      const response = await fetch(`/api/projects?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProjects(data.data || []);
        setTotalProjects(data.pagination?.total || 0);

        // Don't update tab counts here - they should only be updated from fetchAllProjectsForCounts
        // to avoid incorrect counts when switching tabs
      } else {
        setError(
          "Failed to fetch projects: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching projects: " + err.message);
    } finally {
      setLoading(false);
    }
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

  const getProjectTypeColor = (type) => {
    switch (type) {
      case "infrastructure":
        return "primary";
      case "residential":
        return "secondary";
      case "commercial":
        return "success";
      case "road_construction":
        return "warning";
      case "renovation":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  const updateTabCounts = (projectsData) => {
    const counts = {
      all: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      on_hold: 0,
    };

    projectsData.forEach((project) => {
      counts.all++; // Count all projects
      if (counts.hasOwnProperty(project.status)) {
        counts[project.status]++;
      }
    });

    setTabCounts(counts);
  };

  const fetchAllProjectsForCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/projects?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        updateTabCounts(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching project counts:", err);
    }
  };

  const handleViewProject = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type === "application/pdf" ||
        file.type.includes("document")
    );

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/documents/${fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete file");
      }

      // Update project files list locally
      setProjectFiles((prev) => prev.filter((file) => file.id !== fileId));

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "File deleted successfully!",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error deleting file:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete file. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    }
  };

  const handleDeleteProject = async (project) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${project.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        container: "swal-z-index-fix",
      },
      didOpen: () => {
        const swalContainer = document.querySelector(".swal-z-index-fix");
        if (swalContainer) {
          swalContainer.style.zIndex = "9999";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(`/api/projects/${project.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete project");
        }

        // Refresh projects list
        fetchProjects();
        fetchAllProjectsForCounts(); // Refresh tab counts

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Project has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } catch (err) {
        console.error("Error deleting project:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete project. Please try again.",
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const projectData = {
        name: projectForm.name,
        description: projectForm.description,
        location_name: projectForm.location_name,
        latitude: projectForm.latitude,
        longitude: projectForm.longitude,
        status: projectForm.status,
        start_date: projectForm.start_date,
        end_date: projectForm.end_date,
        budget_estimate: projectForm.budget_estimate,
        actual_cost: projectForm.actual_cost,
        currency: projectForm.currency,
        contractor_name: projectForm.contractor_name,
        client_name: projectForm.client_name,
        funding_source: projectForm.funding_source,
        engineer_in_charge: projectForm.engineer_in_charge,
        progress_percent: projectForm.progress_percent,
        blueprint_url: projectForm.blueprint_url,
        notes: projectForm.notes,
      };

      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update project");
      }

      // Reset form and close dialog
      setProjectForm({
        name: "",
        description: "",
        location_name: "",
        latitude: "",
        longitude: "",
        status: "pending",
        start_date: "",
        end_date: "",
        budget_estimate: 0,
        actual_cost: 0,
        currency: "KES",
        contractor_name: "",
        client_name: "",
        funding_source: "",
        engineer_in_charge: "",
        progress_percent: 0,
        blueprint_url: "",
        notes: "",
      });
      setOpenEditDialog(false);
      setSelectedProject(null);

      // Refresh projects list
      fetchProjects();

      // Show success message with SweetAlert
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Project has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error updating project:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update project. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${brand.sidebarBorder}`,
          boxShadow: "0 4px 24px rgba(14, 59, 94, 0.08)",
          bgcolor: brand.sidebarBg,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: appBarGradient,
            px: { xs: 2, sm: 3 },
            py: { xs: 2.5, sm: 3 },
            color: "#fff",
            borderBottom: `3px solid ${brand.gold}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.06),
            }}
          />
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
            position="relative"
            zIndex={1}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha("#fff", 0.12),
                  border: `1px solid ${alpha(brand.gold, 0.45)}`,
                }}
              >
                <ProjectIcon sx={{ fontSize: 28, color: brand.gold }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Projects Management
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.88, mt: 0.5, color: alpha("#fff", 0.9) }}
                >
                  Manage foundation projects and programs
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/projects/create")}
              sx={{
                bgcolor: brand.green,
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: `0 6px 20px ${alpha(brand.green, 0.45)}`,
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  bgcolor: brand.greenLight,
                  boxShadow: `0 8px 24px ${alpha(brand.green, 0.5)}`,
                  transform: "translateY(-1px)",
                },
              }}
            >
              Create New Project
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box mb={3}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                "& .MuiTabs-indicator": {
                  backgroundColor: brand.green,
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  minHeight: 44,
                  color: brand.sidebarTextMuted,
                  "&.Mui-selected": {
                    color: brand.navy,
                  },
                  "&:hover": {
                    color: brand.green,
                    bgcolor: alpha(brand.green, 0.06),
                  },
                },
              }}
            >
              {statusTabs.map((tab, index) => (
                <Tab
                  key={tab.value}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{tab.label}</span>
                      <Chip
                        label={tab.count}
                        size="small"
                        sx={{
                          height: 22,
                          minWidth: 22,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: activeTab === index ? brand.green : alpha(brand.navy, 0.08),
                          color: activeTab === index ? "#fff" : brand.sidebarTextMuted,
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          <TableContainer
            sx={{
              borderRadius: 2,
              overflowX: "auto",
              border: `1px solid ${brand.sidebarBorder}`,
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: alpha(brand.navy, 0.25),
                borderRadius: 3,
              },
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: brand.navy,
                    "& .MuiTableCell-head": {
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: `2px solid ${brand.gold}`,
                      py: 1.75,
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>No</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress sx={{ color: brand.green }} size={36} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="error" variant="body1" fontWeight={600}>
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <ProjectIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2), mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        No projects found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project, idx) => {
                    const catStyle = getCategoryStyle(project.category);
                    const statusStyle = getStatusStyle(project.status);
                    const progress = project.progress || 0;

                    return (
                    <TableRow
                      key={project.id}
                      hover
                      sx={{
                        "&:nth-of-type(even)": { bgcolor: brand.sidebarBgAlt },
                        "&:hover": { bgcolor: alpha(brand.green, 0.06) },
                        "& .MuiTableCell-root": {
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          py: { xs: 1.25, sm: 1.75 },
                          borderColor: brand.sidebarBorder,
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: brand.navy, width: 48 }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={brand.navy}>
                          {project.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.category?.replace(/_/g, " ")}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: catStyle.bg,
                            color: catStyle.color,
                            border: `1px solid ${catStyle.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <LocationIcon sx={{ color: brand.green, fontSize: 17 }} />
                          <Typography variant="body2" color={brand.sidebarTextMuted}>
                            {project.county}
                            {project.subcounty ? `, ${project.subcounty}` : ""}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusStyle.label}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(brand.navy, 0.1),
                              overflow: "hidden",
                              minWidth: 56,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${progress}%`,
                                height: "100%",
                                borderRadius: 3,
                                bgcolor:
                                  progress >= 100
                                    ? brand.green
                                    : progress >= 50
                                      ? brand.blue
                                      : brand.gold,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            color={brand.navy}
                            sx={{ minWidth: 32 }}
                          >
                            {progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewProject(project)}
                              sx={{
                                color: brand.green,
                                bgcolor: alpha(brand.green, 0.1),
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: alpha(brand.green, 0.2) },
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit project" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditProject(project)}
                              sx={{
                                color: brand.blue,
                                bgcolor: alpha(brand.blue, 0.1),
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: alpha(brand.blue, 0.18) },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete project" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProject(project)}
                              sx={{
                                color: "#c62828",
                                bgcolor: alpha("#c62828", 0.08),
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: alpha("#c62828", 0.15) },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalProjects}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: `1px solid ${brand.sidebarBorder}`,
              "& .MuiTablePagination-toolbar": { color: brand.navy },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                color: brand.sidebarTextMuted,
                fontWeight: 500,
              },
              "& .MuiIconButton-root": {
                color: brand.navy,
                "&.Mui-disabled": { color: alpha(brand.navy, 0.3) },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Project Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setSelectedProject(null);
            setProjectForm({
              name: "",
              description: "",
              location_name: "",
              latitude: "",
              longitude: "",
              status: "pending",
              start_date: "",
              end_date: "",
              budget_estimate: 0,
              actual_cost: 0,
              currency: "KES",
              contractor_name: "",
              client_name: "",
              funding_source: "",
              engineer_in_charge: "",
              progress_percent: 0,
              blueprint_url: "",
              notes: "",
            });
            setSelectedFiles([]);
            setProjectFiles([]);
          }}
          maxWidth="xs"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              maxHeight: "85vh",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              overflow: "hidden",
            },
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -15,
                left: -15,
                width: 80,
                height: 80,
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <ProjectIcon
              sx={{ position: "relative", zIndex: 1, fontSize: 28 }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {openViewDialog ? "Project Details" : "Create New Project"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {openViewDialog
                  ? "View project information"
                  : "Add a new project to the system"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            {openViewDialog ? (
              // View Event Details - Enhanced UI
              <Box>
                {/* Event Header Section */}
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 3,
                    p: 3,
                    mb: 4,
                    mt: 2,
                    position: "relative",
                    overflow: "hidden",
                    color: "white",
                  }}
                >
                  {/* Decorative Elements */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "50%",
                      zIndex: 0,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -15,
                      left: -15,
                      width: 80,
                      height: 80,
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "50%",
                      zIndex: 0,
                    }}
                  />

                  {/* Content */}
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        background: "linear-gradient(45deg, #fff, #f0f8ff)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {selectedEvent.eventTitle}
                    </Typography>

                    {selectedEvent.description && (
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          lineHeight: 1.6,
                          fontSize: "1rem",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        }}
                      >
                        {selectedEvent.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Event Details Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {/* Venue Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(255, 107, 107, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LocationIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.8,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Venue
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {selectedEvent.venue}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Date Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(78, 205, 196, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(78, 205, 196, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CalendarIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.8,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Event Date
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {formatDate(selectedEvent.eventDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Time Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(254, 202, 87, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(254, 202, 87, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TimeIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.8,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Time
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {selectedEvent.startTime || "TBD"} -{" "}
                            {selectedEvent.endTime || "TBD"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Attendance Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%)",
                        color: "#2c3e50",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(168, 230, 207, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(168, 230, 207, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(44, 62, 80, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PeopleIcon sx={{ fontSize: 24, color: "#2c3e50" }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Expected Attendance
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {selectedEvent.expectedAttendance || 0} people
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Status Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #ffd93d 0%, #6bcf7f 100%)",
                        color: "#2c3e50",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(255, 217, 61, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(255, 217, 61, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(44, 62, 80, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <EventIcon sx={{ fontSize: 24, color: "#2c3e50" }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Status
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {selectedEvent.status}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Type Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #c44569 0%, #f8b500 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(196, 69, 105, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(196, 69, 105, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <EventIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.8,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Event Type
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {selectedEvent.eventType}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* Additional Information Section */}
                <Box
                  sx={{
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#667eea",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <EventIcon />
                    Additional Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Public Event
                        </Typography>
                        <Chip
                          label={selectedEvent.isPublic ? "Public" : "Private"}
                          color={selectedEvent.isPublic ? "success" : "default"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            textTransform: "capitalize",
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Actual Attendance
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: selectedEvent.actualAttendance
                              ? "#27ae60"
                              : "#7f8c8d",
                          }}
                        >
                          {selectedEvent.actualAttendance || "Not recorded"}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Created By
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedEvent.creator?.name || "Unknown"}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Created At
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedEvent.createdAt
                            ? new Date(selectedEvent.createdAt).toLocaleString()
                            : "Unknown"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Invites Section */}
                {selectedEvent.invites && selectedEvent.invites.length > 0 && (
                  <Box
                    sx={{
                      background: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 3,
                      p: 3,
                      mb: 3,
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#667eea",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <PeopleIcon />
                      Invited Contacts ({selectedEvent.invites.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedEvent.invites.map((invite, index) => (
                        <Chip
                          key={index}
                          label={invite}
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            fontWeight: 600,
                            borderRadius: 2,
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Event Images Section */}
                {selectedEvent.images && selectedEvent.images.length > 0 && (
                  <Box
                    sx={{
                      background: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 3,
                      p: 3,
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#667eea",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ImageIcon />
                      Event Images ({selectedEvent.images.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {selectedEvent.images.map((image, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 140,
                            height: 140,
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "3px solid #e0e0e0",
                            cursor: "pointer",
                            position: "relative",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                            "&:hover": {
                              border: "3px solid #667eea",
                              transform: "scale(1.05)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          <img
                            src={`/api/${image}`}
                            alt={`Event ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              backgroundColor: "rgba(0,0,0,0.8)",
                              color: "white",
                              borderRadius: "50%",
                              width: 28,
                              height: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              border: "2px solid white",
                            }}
                          >
                            {index + 1}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              // Create New Event Form
              <Box
                component="form"
                noValidate
                sx={{ maxHeight: "45vh", overflowY: "auto" }}
              >
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {/* Event Title */}
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={projectForm.name}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        name: e.target.value,
                      })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />

                  {/* Location */}
                  <TextField
                    fullWidth
                    label="Location"
                    value={projectForm.location_name}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        location_name: e.target.value,
                      })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />

                  {/* Start Date and End Date Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          start_date: e.target.value,
                        })
                      }
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={projectForm.end_date}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          end_date: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Budget and Currency Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Budget Estimate"
                      type="number"
                      value={projectForm.budget_estimate}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          budget_estimate: parseFloat(e.target.value) || 0,
                        })
                      }
                      variant="outlined"
                      size="small"
                    />
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={projectForm.currency}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            currency: e.target.value,
                          })
                        }
                        label="Currency"
                      >
                        <MenuItem value="KES">KES</MenuItem>
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Contractor and Client Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Contractor Name"
                      value={projectForm.contractor_name}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          contractor_name: e.target.value,
                        })
                      }
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Client Name"
                      value={projectForm.client_name}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          client_name: e.target.value,
                        })
                      }
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Status */}
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={projectForm.status}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          status: e.target.value,
                        })
                      }
                      label="Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="on_hold">On Hold</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => {
                setOpenViewDialog(false);
                setOpenEditDialog(false);
                setOpenCreateDialog(false);
                setSelectedEvent(null);
                setEventForm({
                  eventTitle: "",
                  venue: "",
                  description: "",
                  eventDate: "",
                  startTime: "",
                  endTime: "",
                  eventType: "meeting",
                  status: "planned",
                  expectedAttendance: 0,
                  actualAttendance: null,
                  isPublic: false,
                  invites: "",
                });
                setSelectedImages([]);
                setEventImages([]);
              }}
              variant="outlined"
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                "&:hover": {
                  borderColor: "#5a6fd8",
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              {openViewDialog ? "Close" : "Cancel"}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default Projects;
