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
  Tabs,
  Tab,
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
  Event as EventIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Folder,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import { brand } from "../../brandColors";
import { fieldSx } from "../Projects/projectFormUi";
import {
  listPaperSx,
  ListPageHeader,
  createButtonSx,
  tabsSx,
  tableContainerSx,
  tableHeadRowSx,
  tableRowSx,
  paginationSx,
  actionButtonSx,
  dialogPaperSx,
  BrandedDialogTitle,
  DetailRow,
  dialogActionsSx,
  saveButtonSx,
  cancelButtonSx,
  detailCardSx,
} from "../Util/adminListUi";

const Documents = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filter, setFilter] = useState("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [documentForm, setDocumentForm] = useState({
    title: "",
    description: "",
    file_type: "pdf",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [page, rowsPerPage, filter, documentTypeFilter]);

  const fetchDocuments = async () => {
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

      if (documentTypeFilter !== "all") {
        queryParams.append("file_type", documentTypeFilter);
      }

      const response = await fetch(`/api/documents?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.data || []);
        setTotalDocuments(data.count || 0);
      } else {
        setError(
          "Failed to fetch documents: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching documents: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case "pdf":
        return "error";
      case "word":
        return "primary";
      case "excel":
        return "success";
      case "powerpoint":
        return "warning";
      case "image":
        return "secondary";
      case "text":
        return "default";
      default:
        return "default";
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return "📄";
      case "word":
        return "📝";
      case "excel":
        return "📊";
      case "image":
        return "🖼️";
      case "powerpoint":
        return "📊";
      case "text":
        return "📝";
      default:
        return "📁";
    }
  };

  const getFileTypeStyle = (type) => {
    const map = {
      pdf: { bg: alpha("#c62828", 0.1), color: "#c62828", border: alpha("#c62828", 0.25) },
      word: { bg: alpha(brand.blue, 0.1), color: brand.blue, border: alpha(brand.blue, 0.25) },
      excel: { bg: alpha(brand.green, 0.12), color: brand.greenDark, border: alpha(brand.green, 0.3) },
      powerpoint: { bg: alpha("#e65100", 0.1), color: "#e65100", border: alpha("#e65100", 0.25) },
      image: { bg: alpha(brand.navy, 0.08), color: brand.navy, border: alpha(brand.navy, 0.2) },
      text: { bg: alpha(brand.navy, 0.06), color: brand.sidebarTextMuted, border: brand.sidebarBorder },
    };
    return map[type] || map.text;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setOpenViewDialog(true);
  };

  const handleDeleteDocument = async (document) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${document.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(`/api/documents/${document.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete document");
        }

        // Refresh documents list
        fetchDocuments();

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Document has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error deleting document:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete document. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Required",
          text: "Please login again to download documents.",
        });
        return;
      }

      // Show loading state
      Swal.fire({
        title: "Downloading...",
        text: "Please wait while we prepare your document",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Fetch the document with authentication
      const response = await fetch(`/api/documents/${documentId}/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from Content-Disposition header or use document ID
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `document-${documentId}`;
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
        title: "Download Complete!",
        text: "Document downloaded successfully",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Error downloading document:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: error.message || "Failed to download document. Please try again.",
      });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect file type based on extension
      const extension = file.name.split(".").pop().toLowerCase();
      let detectedType = "other";
      if (["pdf"].includes(extension)) detectedType = "pdf";
      else if (["doc", "docx"].includes(extension)) detectedType = "word";
      else if (["xls", "xlsx"].includes(extension)) detectedType = "excel";
      else if (["ppt", "pptx"].includes(extension)) detectedType = "powerpoint";
      else if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) detectedType = "image";
      else if (["txt", "csv"].includes(extension)) detectedType = "text";
      
      setDocumentForm({
        ...documentForm,
        title: file.name,
        file_type: detectedType,
      });
    }
  };

  const handleCreateDocument = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      if (!selectedFile) {
        Swal.fire({
          icon: "error",
          title: "No File Selected",
          text: "Please select a file to upload.",
        });
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("title", documentForm.title);
      formData.append("description", documentForm.description);
      formData.append("file_type", documentForm.file_type);

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create document");
      }

      // Reset form and close dialog
      setDocumentForm({
        title: "",
        description: "",
        file_type: "pdf",
      });
      setSelectedFile(null);
      setOpenCreateDialog(false);
      setSelectedDocument(null);

      // Refresh documents list
      fetchDocuments();

      // Show success message with SweetAlert
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Document uploaded successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error creating document:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Failed to create document. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (error && documents.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={listPaperSx}>
        <ListPageHeader
          icon={Folder}
          title="Document Management"
          subtitle="Manage company documents and files"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedDocument(null);
                setDocumentForm({ title: "", description: "", file_type: "pdf" });
                setOpenCreateDialog(true);
              }}
              sx={createButtonSx}
            >
              Add New Document
            </Button>
          }
        />

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box mb={2.5}>
            <Tabs
              value={documentTypeFilter}
              onChange={(e, newValue) => setDocumentTypeFilter(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={tabsSx}
            >
              <Tab label="All Documents" value="all" />
              <Tab label="PDF" value="pdf" />
              <Tab label="Word" value="word" />
              <Tab label="Excel" value="excel" />
              <Tab label="PowerPoint" value="powerpoint" />
              <Tab label="Images" value="image" />
              <Tab label="Text Files" value="text" />
            </Tabs>
          </Box>

          <TableContainer sx={tableContainerSx}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={tableHeadRowSx}>
                  <TableCell>No</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>File Type</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress sx={{ color: brand.green }} size={36} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                      <Button variant="contained" onClick={fetchDocuments} sx={{ bgcolor: brand.green, "&:hover": { bgcolor: brand.greenLight } }}>
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Folder sx={{ fontSize: 48, color: alpha(brand.navy, 0.2), mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>No documents found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((document, idx) => {
                    const typeStyle = getFileTypeStyle(document.file_type);
                    return (
                    <TableRow key={document.id} hover sx={tableRowSx}>
                      <TableCell sx={{ fontWeight: 700, color: brand.navy, width: 48 }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography sx={{ fontSize: "1.2rem" }}>{getFileTypeIcon(document.file_type)}</Typography>
                          <Typography variant="body2" fontWeight={600} color={brand.navy}>{document.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={document.file_type}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "capitalize", bgcolor: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={brand.navy}>
                          {document.uploader?.full_name || "Unknown"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={brand.sidebarTextMuted} fontWeight={500}>
                          {formatDate(document.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Download" arrow>
                            <IconButton size="small" onClick={() => handleDownloadDocument(document.id)} sx={actionButtonSx.view}>
                              <UploadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View details" arrow>
                            <IconButton size="small" onClick={() => handleViewDocument(document)} sx={actionButtonSx.edit}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton size="small" onClick={() => handleDeleteDocument(document)} sx={actionButtonSx.delete}>
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
            count={totalDocuments}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={paginationSx}
          />
        </Box>

        <Dialog
          open={openViewDialog || openCreateDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setOpenCreateDialog(false);
            setSelectedDocument(null);
            setDocumentForm({ title: "", description: "", file_type: "pdf" });
          }}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: dialogPaperSx }}
        >
          <BrandedDialogTitle
            icon={Folder}
            title={openViewDialog ? "Document Details" : "Add New Document"}
            subtitle={openViewDialog ? "View document information" : "Add a new document to the system"}
          />
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            {openViewDialog ? (
              // View Document Details - Card Layout
              <Box>
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
                      {selectedDocument?.title || "N/A"}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: "1.5rem" }}>
                        {getFileTypeIcon(selectedDocument.file_type)}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          lineHeight: 1.6,
                          fontSize: "1rem",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        }}
                      >
                        {selectedDocument.file_type.toUpperCase()} Document
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Card
                    sx={{
                      background: "white",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Folder sx={{ fontSize: 24, color: "#667eea" }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#7f8c8d" }}>
                          FILE TYPE
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                          <Chip
                            label={selectedDocument.file_type}
                            color={getFileTypeColor(selectedDocument.file_type)}
                            size="small"
                            sx={{ textTransform: "capitalize", fontWeight: 600 }}
                          />
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  <Card
                    sx={{
                      background: "white",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <PersonIcon sx={{ fontSize: 24, color: "#667eea" }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#7f8c8d" }}>
                          UPLOADED BY
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                          {selectedDocument.uploader?.full_name || "Unknown"}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  <Card
                    sx={{
                      background: "white",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <CalendarIcon sx={{ fontSize: 24, color: "#667eea" }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#7f8c8d" }}>
                          UPLOAD DATE
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                          {formatDate(selectedDocument.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  {selectedDocument.description && (
                    <Card
                      sx={{
                        background: "white",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <DescriptionIcon sx={{ fontSize: 24, color: "#667eea", mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: "#7f8c8d" }}>
                            DESCRIPTION
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#2c3e50", mt: 0.5 }}>
                            {selectedDocument.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  )}
                </Stack>

                {/* Download Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#2c3e50" }}
                  >
                    Actions
                  </Typography>
                  <Card
                    sx={{
                      background: "white",
                      borderRadius: 2,
                      p: 3,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => handleDownloadDocument(selectedDocument.id)}
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Download Document
                    </Button>
                  </Card>
                </Box>
              </Box>
            ) : (
              // Create/Edit Worker Form
              <Box
                component="form"
                noValidate
                sx={{ maxHeight: "45vh", overflowY: "auto" }}
              >
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {/* Title */}
                  <TextField
                    fullWidth
                    label="Title"
                    value={documentForm.title}
                    onChange={(e) =>
                      setDocumentForm({
                        ...documentForm,
                        title: e.target.value,
                      })
                    }
                    variant="outlined"
                    size="small"
                    required
                    placeholder="Document title"
                  />

                  {/* File Type Selection */}
                  <FormControl
                    fullWidth
                    variant="outlined"
                    size="small"
                    required
                  >
                    <InputLabel>File Type</InputLabel>
                    <Select
                      value={documentForm.file_type}
                      onChange={(e) =>
                        setDocumentForm({
                          ...documentForm,
                          file_type: e.target.value,
                        })
                      }
                      label="File Type"
                    >
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="word">Word Document</MenuItem>
                      <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                      <MenuItem value="powerpoint">PowerPoint</MenuItem>
                      <MenuItem value="image">Image</MenuItem>
                      <MenuItem value="text">Text File</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Description */}
                  <TextField
                    fullWidth
                    label="Description"
                    value={documentForm.description}
                    onChange={(e) =>
                      setDocumentForm({
                        ...documentForm,
                        description: e.target.value,
                      })
                    }
                    variant="outlined"
                    size="small"
                    multiline
                    rows={3}
                    placeholder="Document description or notes"
                  />

                  {/* File Upload Section */}
                  <Box
                    sx={{
                      border: "2px dashed #667eea",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                    }}
                  >
                    <UploadIcon
                      sx={{ fontSize: 48, color: "#667eea", mb: 1 }}
                    />
                    <Typography variant="h6" sx={{ mb: 1, color: "#667eea" }}>
                      Upload Document
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Drag and drop files here, or click to select files
                    </Typography>
                    {selectedFile && (
                      <Box
                        sx={{
                          mb: 2,
                          p: 1,
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#667eea" }}
                        >
                          Selected: {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </Typography>
                      </Box>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      id="file-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="contained"
                        component="span"
                        sx={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {selectedFile ? "Change File" : "Choose File"}
                      </Button>
                    </label>
                  </Box>
                </Stack>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={dialogActionsSx}>
            <Button
              onClick={() => {
                setOpenViewDialog(false);
                setOpenCreateDialog(false);
                setSelectedDocument(null);
                setDocumentForm({ title: "", description: "", file_type: "pdf" });
              }}
              variant="outlined"
              sx={cancelButtonSx}
            >
              {openViewDialog ? "Close" : "Cancel"}
            </Button>
            {openCreateDialog && (
              <Button
                onClick={handleCreateDocument}
                variant="contained"
                startIcon={<AddIcon />}
                sx={saveButtonSx}
                disabled={!documentForm.title || !documentForm.file_type || !selectedFile}
              >
                Add Document
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Documents;
