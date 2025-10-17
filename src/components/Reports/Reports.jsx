import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
  Badge,
  LinearProgress,
  CardActionArea,
  CardActions,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Description as WordIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Assessment as ReportIcon,
  History as HistoryIcon,
  GetApp as ExportIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  DataUsage as DataUsageIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  CloudDownload as CloudDownloadIcon,
  AutoAwesome as AutoAwesomeIcon,
  RocketLaunch as RocketLaunchIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // State management
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Form state
  const [reportForm, setReportForm] = useState({
    startDate: new Date(2025, 0, 1), // January 1st, 2025
    endDate: new Date(2025, 11, 31), // December 31st, 2025
    reportType: "all",
  });

  // Report type options
  const reportTypes = [
    { value: "all", label: "All Data", description: "Complete report with all sections", color: "#2196f3" },
    { value: "projects", label: "Projects Only", description: "Project-specific data and statistics", color: "#4caf50" },
    { value: "inquiries", label: "Inquiries Only", description: "Inquiry data and status breakdown", color: "#ff9800" },
    { value: "documents", label: "Documents Only", description: "Document upload statistics", color: "#9c27b0" },
    { value: "activities", label: "Activities Only", description: "Audit trail and activity logs", color: "#e91e63" },
  ];

  // Handle component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle form changes
  const handleInputChange = (field, value) => {
    setReportForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Preview report data
  const handlePreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Format dates in local timezone to avoid timezone conversion issues
      const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const queryParams = new URLSearchParams({
        startDate: formatLocalDate(reportForm.startDate),
        endDate: formatLocalDate(reportForm.endDate),
        reportType: reportForm.reportType,
      });

      const response = await fetch(`/api/reports/data?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
        setPreviewOpen(true);
      } else {
        throw new Error(data.message || "Failed to fetch report data");
      }
    } catch (err) {
      console.error("Error previewing report:", err);
      setError(err.message);
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to preview report data",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setLoading(false);
    }
  };


  // Generate and download Word report
  const handleGenerateWord = async () => {
    try {
      setGenerating(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Show loading state
      Swal.fire({
        title: "Generating Word Document...",
        text: "Please wait while we prepare your report",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Format dates in local timezone to avoid timezone conversion issues
      const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const startDateStr = formatLocalDate(reportForm.startDate);
      const endDateStr = formatLocalDate(reportForm.endDate);
      
      
      const queryParams = new URLSearchParams({
        startDate: startDateStr,
        endDate: endDateStr,
        reportType: reportForm.reportType,
      });

      const response = await fetch(`/api/reports/word?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `activity_report_${reportForm.startDate.toISOString().split('T')[0]}_to_${reportForm.endDate.toISOString().split('T')[0]}.docx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Close loading and show success
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Word Document Generated!",
        text: "Your report has been downloaded successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset preview to empty state after successful generation
      setReportData(null);

    } catch (err) {
      console.error("Error generating Word document:", err);
      Swal.close();
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to generate Word report",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 1.5 },
          minHeight: "100vh",
          background: "#f5f7fa",
        }}
      >
        <Card
          sx={{
            background: "white",
            borderRadius: 4,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <CircularProgress size={60} sx={{ color: "#667eea" }} />
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 1.5 },
          minHeight: "100vh",
          background: "#f5f7fa",
        }}
      >
        {/* Main Card Container */}
        <Card
          sx={{
            background: "white",
            borderRadius: 4,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>

            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Box sx={{ p: 4, pb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        mr: 2,
                        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <ReportIcon sx={{ fontSize: 32, color: "white" }} />
                    </Avatar>
                  </motion.div>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 900,
                        color: "#2c3e50",
                        fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
                        mb: 1,
                      }}
                    >
                      Report Generation
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#7f8c8d",
                        fontSize: { xs: "1rem", sm: "1.2rem" },
                      }}
                    >
                      Generate comprehensive reports with beautiful visualizations
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ px: 4, pb: 2 }}>
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    }}
                  >
                    {error}
                  </Alert>
                </Box>
              </motion.div>
            )}

            <Box sx={{ px: 4, pb: 4 }}>
              <Grid container spacing={3}>
          {/* Report Configuration Panel */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card
                sx={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                        boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <SettingsIcon sx={{ color: "white", fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#2c3e50", mb: 0.5 }}>
                        Configuration
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Set up your report parameters
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={4}>
                    {/* Date Range Section */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <CalendarIcon sx={{ color: "#667eea", mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                          Date Range
                        </Typography>
                      </Box>
                      <Stack spacing={3}>
                        <DatePicker
                          label="Start Date"
                          value={reportForm.startDate}
                          onChange={(date) => handleInputChange("startDate", date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 3,
                                  backgroundColor: "rgba(102, 126, 234, 0.05)",
                                  "&:hover": {
                                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                                  },
                                },
                              },
                              InputProps: {
                                startAdornment: <CalendarIcon sx={{ mr: 1, color: "#667eea" }} />,
                              },
                            },
                          }}
                        />
                        <DatePicker
                          label="End Date"
                          value={reportForm.endDate}
                          onChange={(date) => handleInputChange("endDate", date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 3,
                                  backgroundColor: "rgba(102, 126, 234, 0.05)",
                                  "&:hover": {
                                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                                  },
                                },
                              },
                              InputProps: {
                                startAdornment: <CalendarIcon sx={{ mr: 1, color: "#667eea" }} />,
                              },
                            },
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Report Type Section */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <DataUsageIcon sx={{ color: "#667eea", mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                          Report Type
                        </Typography>
                      </Box>
                      <FormControl fullWidth>
                        <InputLabel>Select Report Type</InputLabel>
                        <Select
                          value={reportForm.reportType}
                          onChange={(e) => handleInputChange("reportType", e.target.value)}
                          label="Select Report Type"
                          sx={{
                            borderRadius: 3,
                            backgroundColor: "rgba(102, 126, 234, 0.05)",
                            "&:hover": {
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                            },
                          }}
                        >
                          {reportTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    backgroundColor: type.color,
                                    mr: 2,
                                  }}
                                />
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {type.label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {type.description}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Action Buttons */}
                    <Stack spacing={2}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <PreviewIcon />}
                          onClick={handlePreview}
                          disabled={loading}
                          fullWidth
                          size="large"
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            py: 2,
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            borderRadius: 3,
                            boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                              boxShadow: "0 12px 30px rgba(102, 126, 234, 0.4)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {loading ? "Loading..." : "Preview Data"}
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="contained"
                          startIcon={generating ? <CircularProgress size={20} /> : <WordIcon />}
                          onClick={handleGenerateWord}
                          disabled={generating}
                          fullWidth
                          size="large"
                          sx={{
                            background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                            py: 2,
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            borderRadius: 3,
                            boxShadow: "0 8px 20px rgba(33, 150, 243, 0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
                              boxShadow: "0 12px 30px rgba(33, 150, 243, 0.4)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {generating ? "Generating Word Document..." : "Generate Word Document"}
                        </Button>
                      </motion.div>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Report Preview Panel */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card
                sx={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                        boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <PreviewIcon sx={{ color: "white", fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#2c3e50", mb: 0.5 }}>
                        Report Preview
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Preview your data before generating the report
                      </Typography>
                    </Box>
                  </Box>

                  <AnimatePresence mode="wait">
                    {reportData ? (
                      <motion.div
                        key="preview-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Summary Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          {reportData.summary && Object.entries(reportData.summary).map(([key, data], index) => (
                            <Grid item xs={6} sm={3} key={key}>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                              >
                                <Card
                                  sx={{
                                    p: 3,
                                    textAlign: "center",
                                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                                    border: "1px solid rgba(102, 126, 234, 0.1)",
                                    borderRadius: 3,
                                    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                      transform: "translateY(-4px)",
                                      boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                                    },
                                  }}
                                >
                                  <Typography variant="h3" sx={{ fontWeight: 800, color: "#2c3e50", mb: 1 }}>
                                    {data.total || 0}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "text.secondary", textTransform: "capitalize", fontWeight: 600 }}>
                                    {key}
                                  </Typography>
                                </Card>
                              </motion.div>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Report Details */}
                        <Accordion 
                          defaultExpanded
                          sx={{ 
                            mb: 3, 
                            borderRadius: 3,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            "&:before": { display: "none" },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "white",
                              borderRadius: "12px 12px 0 0",
                              "& .MuiAccordionSummary-content": {
                              margin: "16px 0",
                            },
                          }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <TimelineIcon sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Report Details
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 3 }}>
                            <Stack spacing={2}>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <ScheduleIcon sx={{ color: "#667eea", mr: 1 }} />
                                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                                  <strong>Period:</strong> {formatDate(reportData.dateRange.start)} - {formatDate(reportData.dateRange.end)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <CheckCircleIcon sx={{ color: "#4caf50", mr: 1 }} />
                                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                                  <strong>Generated:</strong> {formatDate(new Date())}
                                </Typography>
                              </Box>
                            </Stack>
                          </AccordionDetails>
                        </Accordion>

                        {/* Data Sections */}
                        <Grid container spacing={3}>
                          {reportData.projects && reportData.projects.length > 0 && (
                            <Grid item xs={12} sm={6}>
                              <Card sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <BarChartIcon sx={{ color: "#2196f3", mr: 1 }} />
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                                    Projects ({reportData.projects.length})
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  Latest: {reportData.projects[0]?.name || "N/A"}
                                </Typography>
                              </Card>
                            </Grid>
                          )}

                          {reportData.inquiries && reportData.inquiries.length > 0 && (
                            <Grid item xs={12} sm={6}>
                              <Card sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <PieChartIcon sx={{ color: "#ff9800", mr: 1 }} />
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                                    Inquiries ({reportData.inquiries.length})
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  Latest: {reportData.inquiries[0]?.full_name || "N/A"}
                                </Typography>
                              </Card>
                            </Grid>
                          )}

                          {reportData.documents && reportData.documents.length > 0 && (
                            <Grid item xs={12} sm={6}>
                              <Card sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <FileDownloadIcon sx={{ color: "#9c27b0", mr: 1 }} />
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                                    Documents ({reportData.documents.length})
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  Latest: {reportData.documents[0]?.filename || "N/A"}
                                </Typography>
                              </Card>
                            </Grid>
                          )}

                          {reportData.activities && reportData.activities.length > 0 && (
                            <Grid item xs={12} sm={6}>
                              <Card sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <TimelineIcon sx={{ color: "#e91e63", mr: 1 }} />
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                                    Activities ({reportData.activities.length})
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  Latest: {reportData.activities[0]?.action || "N/A"}
                                </Typography>
                              </Card>
                            </Grid>
                          )}
                        </Grid>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 4, // Reduced padding to match content height
                            color: "text.secondary",
                            minHeight: "400px", // Fixed height to prevent layout shift
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          >
                            <PreviewIcon sx={{ fontSize: 80, mb: 3, opacity: 0.3 }} />
                          </motion.div>
                          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#2c3e50" }}>
                            Ready to Generate Reports
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 3 }}>
                            Click "Preview Data" to see a summary of your report
                          </Typography>
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ 
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          >
                            <RocketLaunchIcon sx={{ fontSize: 40, color: "#667eea", opacity: 0.7 }} />
                          </motion.div>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default Reports;
