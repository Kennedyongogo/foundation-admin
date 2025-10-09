import React, { useState, useEffect } from "react";
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
  Avatar,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as ViewIcon,
  Visibility as Visibility,
  VisibilityOff as VisibilityOff,
  AdminPanelSettings as AdminIcon,
  Close as CloseIcon,
  CheckCircle as ActiveIcon,
  CheckCircle,
  Schedule,
  Cancel as InactiveIcon,
  Check as ApproveIcon,
  Block as SuspendIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

const UsersTable = () => {
  const theme = useTheme();

  // Helper to build URL for uploaded assets using Vite proxy
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;

    // Use relative URLs - Vite proxy will handle routing to backend
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "engineer",
    password: "",
    profile_picture: null,
    profile_picture_preview: "",
    isActive: true,
    // Event organizer specific fields
    organization_name: "",
    contact_person: "",
    phone_number: "",
    address: "",
    kra_pin: "",
    bank_name: "",
    bank_account_number: "",
    website: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, activeTab]);

  const fetchUsers = async () => {
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

      // Choose endpoint based on active tab
      const endpoint = activeTab === 0 ? "/api/admins" : "/api/organizers";

      const response = await fetch(`${endpoint}?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
        setTotalUsers(data.count || 0);
      } else {
        setError("Failed to fetch users: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error fetching users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "error";
      case "project_manager":
        return "primary";
      case "engineer":
        return "secondary";
      default:
        return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "client":
        return "primary";
      case "worker":
        return "secondary";
      case "guest":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "error";
  };

  const getStatusColorForOrganizer = (status) => {
    switch (status) {
      case "approved":
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
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
    setPage(0); // Reset to first page when switching tabs
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUserForm({
        ...userForm,
        profile_picture: file,
        profile_picture_preview: URL.createObjectURL(file),
      });
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenViewDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);

    // Convert file path to URL for display (same as blueprints)
    let profilePictureUrl = "";
    if (user.profile_picture || user.profile_image || user.logo) {
      profilePictureUrl = buildImageUrl(
        user.profile_picture || user.profile_image || user.logo
      );
    }

    // Check if this is admin or organizer based on activeTab
    if (activeTab === 0) {
      // Admin user form
      setUserForm({
        name: user.full_name || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "engineer",
        password: "",
        profile_picture: null,
        profile_picture_preview: profilePictureUrl,
        isActive: user.isActive !== undefined ? user.isActive : true,
        organization_name: "",
        contact_person: "",
        phone_number: "",
        address: "",
        kra_pin: "",
        bank_name: "",
        bank_account_number: "",
        website: "",
      });
    } else {
      // Event organizer form
      setUserForm({
        name: "",
        email: user.email || "",
        phone: "",
        role: "engineer",
        password: "",
        profile_picture: null,
        profile_picture_preview: profilePictureUrl,
        isActive: user.isActive !== undefined ? user.isActive : true,
        organization_name: user.organization_name || "",
        contact_person: user.contact_person || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        kra_pin: user.kra_pin || "",
        bank_name: user.bank_name || "",
        bank_account_number: user.bank_account_number || "",
        website: user.website || "",
      });
    }
    setOpenEditDialog(true);
  };

  const handleDeleteUser = async (user) => {
    const userName =
      activeTab === 0
        ? user.full_name || user.name
        : user.organization_name || user.name;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${userName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        // Choose endpoint based on active tab
        const endpoint = activeTab === 0 ? "/api/admins" : "/api/users";

        const response = await fetch(`${endpoint}/${user.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        fetchUsers();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error deleting user:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete user. Please try again.",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleApproveOrganizer = async (organizer) => {
    const result = await Swal.fire({
      title: "Approve Organizer?",
      text: `Approve "${organizer.organization_name}" to start creating events?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#27ae60",
      cancelButtonColor: "#95a5a6",
      confirmButtonText: "Yes, approve!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(
          `/api/organizers/${organizer.id}/approve`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to approve organizer");
        }

        fetchUsers();

        Swal.fire({
          icon: "success",
          title: "Approved!",
          text: "Organizer has been approved successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error approving organizer:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to approve organizer. Please try again.",
        });
      }
    }
  };

  const handleSuspendOrganizer = async (organizer) => {
    const result = await Swal.fire({
      title: "Suspend Organizer?",
      text: `Suspend "${organizer.organization_name}"? They won't be able to create events.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#95a5a6",
      confirmButtonText: "Yes, suspend!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(
          `/api/organizers/${organizer.id}/suspend`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to suspend organizer");
        }

        fetchUsers();

        Swal.fire({
          icon: "success",
          title: "Suspended!",
          text: "Organizer has been suspended successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error suspending organizer:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to suspend organizer. Please try again.",
        });
      }
    }
  };

  const handleUpdateUser = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const formData = new FormData();

      // Add fields based on active tab
      if (activeTab === 0) {
        // Admin user fields
        formData.append("full_name", userForm.name);
        formData.append("email", userForm.email);
        formData.append("phone", userForm.phone);
        formData.append("role", userForm.role);
        formData.append("isActive", userForm.isActive);
      } else {
        // Event organizer fields
        formData.append("organization_name", userForm.organization_name);
        formData.append("contact_person", userForm.contact_person);
        formData.append("email", userForm.email);
        formData.append("phone_number", userForm.phone_number);
        formData.append("address", userForm.address);
        formData.append("kra_pin", userForm.kra_pin);
        formData.append("bank_name", userForm.bank_name);
        formData.append("bank_account_number", userForm.bank_account_number);
        formData.append("website", userForm.website);
      }

      if (userForm.profile_picture) {
        formData.append(
          activeTab === 0 ? "profile_image" : "logo",
          userForm.profile_picture
        );
      }

      // Choose endpoint based on active tab
      const endpoint = activeTab === 0 ? "/api/admins" : "/api/organizers";

      const response = await fetch(`${endpoint}/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update user");
      }

      setUserForm({
        name: "",
        email: "",
        phone: "",
        role: "engineer",
        password: "",
        profile_picture: null,
        profile_picture_preview: "",
        isActive: true,
        organization_name: "",
        contact_person: "",
        phone_number: "",
        address: "",
        kra_pin: "",
        bank_name: "",
        bank_account_number: "",
        website: "",
      });
      setOpenEditDialog(false);
      setSelectedUser(null);

      fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "User has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error updating user:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update user. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const formData = new FormData();

      // Add fields based on active tab
      if (activeTab === 0) {
        // Admin user fields
        formData.append("full_name", userForm.name);
        formData.append("email", userForm.email);
        formData.append("phone", userForm.phone);
        formData.append("role", userForm.role);
        formData.append("password", userForm.password);
        formData.append("isActive", userForm.isActive);
      } else {
        // Event organizer fields
        formData.append("organization_name", userForm.organization_name);
        formData.append("contact_person", userForm.contact_person);
        formData.append("email", userForm.email);
        formData.append("phone_number", userForm.phone_number);
        formData.append("password", userForm.password);
        formData.append("address", userForm.address);
        formData.append("kra_pin", userForm.kra_pin);
        formData.append("bank_name", userForm.bank_name);
        formData.append("bank_account_number", userForm.bank_account_number);
        formData.append("website", userForm.website);
      }

      if (userForm.profile_picture) {
        formData.append(
          activeTab === 0 ? "profile_image" : "logo",
          userForm.profile_picture
        );
      }

      // Choose endpoint based on active tab
      const endpoint = activeTab === 0 ? "/api/admins" : "/api/organizers";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create user");
      }

      setUserForm({
        name: "",
        email: "",
        phone: "",
        role: "engineer",
        password: "",
        profile_picture: null,
        profile_picture_preview: "",
        isActive: true,
        organization_name: "",
        contact_person: "",
        phone_number: "",
        address: "",
        kra_pin: "",
        bank_name: "",
        bank_account_number: "",
        website: "",
      });
      setOpenCreateDialog(false);
      setSelectedUser(null);

      fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User created successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error creating user:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Failed to create user. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "none",
          boxShadow: "none",
          minHeight: "100vh",
        }}
      >
        {/* Header Section */}
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
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={{ xs: 2, sm: 0 }}
            position="relative"
            zIndex={1}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                {activeTab === 0
                  ? "Admin Users Management"
                  : "Event Organizers Management"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {activeTab === 0
                  ? "Manage admin users and permissions"
                  : "Manage event organizers and their accounts"}
              </Typography>
            </Box>
            {activeTab === 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedUser(null);
                  setShowPassword(false);
                  setUserForm({
                    name: "",
                    email: "",
                    phone: "",
                    role: "engineer",
                    password: "",
                    profile_picture: null,
                    profile_picture_preview: "",
                    isActive: true,
                  });
                  setOpenCreateDialog(true);
                }}
                sx={{
                  background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
                  borderRadius: 3,
                  px: { xs: 2, sm: 4 },
                  py: 1.5,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    background: "linear-gradient(45deg, #FF5252, #26A69A)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 35px rgba(255, 107, 107, 0.4)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Create New Admin
              </Button>
            )}
          </Box>
        </Box>

        {/* Content Section */}
        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: "calc(100vh - 200px)" }}
        >
          {/* Tabs */}
          <Box mb={3}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  minHeight: 48,
                  color: "#667eea",
                  "&.Mui-selected": {
                    color: "#667eea",
                    fontWeight: 700,
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#667eea",
                  height: 3,
                  borderRadius: "2px 2px 0 0",
                },
              }}
            >
              <Tab label="Admin Users" />
              <Tab label="Event Organizers" />
            </Tabs>
          </Box>

          {/* Users Table */}
          <TableContainer
            sx={{
              borderRadius: 3,
              overflowX: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(102, 126, 234, 0.3)",
                borderRadius: 4,
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.5)",
                },
              },
            }}
          >
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "& .MuiTableCell-head": {
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "0.8rem", sm: "0.95rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      border: "none",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>No</TableCell>
                  <TableCell>
                    {activeTab === 0 ? "Name" : "Organization"}
                  </TableCell>
                  <TableCell>
                    {activeTab === 0 ? "Phone" : "Contact Person"}
                  </TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: "#667eea" }} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="error" variant="h6">
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        {activeTab === 0
                          ? "No admin users found."
                          : "No event organizers found."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, idx) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "rgba(102, 126, 234, 0.02)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(102, 126, 234, 0.08)",
                          transform: { xs: "none", sm: "scale(1.01)" },
                        },
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "& .MuiTableCell-root": {
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          padding: { xs: "8px 4px", sm: "16px" },
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#667eea" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{ color: "#2c3e50" }}
                        >
                          {activeTab === 0
                            ? user.full_name || user.name
                            : user.organization_name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                          {activeTab === 0
                            ? user.phone || "N/A"
                            : user.contact_person || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            activeTab === 0
                              ? user.isActive
                                ? "Active"
                                : "Inactive"
                              : user.status || "pending"
                          }
                          color={
                            activeTab === 0
                              ? getStatusColor(user.isActive)
                              : getStatusColorForOrganizer(user.status)
                          }
                          size="small"
                          variant="outlined"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View User Details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewUser(user)}
                              sx={{
                                color: "#27ae60",
                                backgroundColor: "rgba(39, 174, 96, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(39, 174, 96, 0.2)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {activeTab === 0 ? (
                            <>
                              <Tooltip title="Edit User" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditUser(user)}
                                  sx={{
                                    color: "#3498db",
                                    backgroundColor: "rgba(52, 152, 219, 0.1)",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(52, 152, 219, 0.2)",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s ease",
                                    borderRadius: 2,
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteUser(user)}
                                  sx={{
                                    color: "#e74c3c",
                                    backgroundColor: "rgba(231, 76, 60, 0.1)",
                                    "&:hover": {
                                      backgroundColor: "rgba(231, 76, 60, 0.2)",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s ease",
                                    borderRadius: 2,
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              {(user.status === "pending" ||
                                user.status === "suspended") && (
                                <Tooltip title="Approve Organizer" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleApproveOrganizer(user)}
                                    sx={{
                                      color: "#27ae60",
                                      backgroundColor: "rgba(39, 174, 96, 0.1)",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(39, 174, 96, 0.2)",
                                        transform: "scale(1.1)",
                                      },
                                      transition: "all 0.2s ease",
                                      borderRadius: 2,
                                    }}
                                  >
                                    <ApproveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {(user.status === "approved" ||
                                user.status === "active") && (
                                <Tooltip title="Suspend Organizer" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSuspendOrganizer(user)}
                                    sx={{
                                      color: "#e67e22",
                                      backgroundColor:
                                        "rgba(230, 126, 34, 0.1)",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(230, 126, 34, 0.2)",
                                        transform: "scale(1.1)",
                                      },
                                      transition: "all 0.2s ease",
                                      borderRadius: 2,
                                    }}
                                  >
                                    <SuspendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderTop: "1px solid rgba(102, 126, 234, 0.1)",
              "& .MuiTablePagination-toolbar": {
                color: "#667eea",
                fontWeight: 600,
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "#2c3e50",
                  fontWeight: 600,
                },
            }}
          />
        </Box>

        {/* User Dialog */}
        <Dialog
          open={openViewDialog || openEditDialog || openCreateDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setOpenEditDialog(false);
            setOpenCreateDialog(false);
            setSelectedUser(null);
            setShowPassword(false);
            setUserForm({
              name: "",
              email: "",
              phone: "",
              role: "campaign_manager",
              password: "",
              isActive: true,
            });
          }}
          maxWidth="sm"
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
            <AdminIcon sx={{ position: "relative", zIndex: 1, fontSize: 28 }} />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {openViewDialog
                  ? "User Details"
                  : openEditDialog
                  ? "Edit User"
                  : "Create New Admin"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {openViewDialog
                  ? "View user information"
                  : openEditDialog
                  ? "Update user details"
                  : "Add a new admin to the system"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            {openViewDialog ? (
              // View User Details
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
                      {activeTab === 0
                        ? selectedUser?.full_name || selectedUser?.name
                        : selectedUser?.organization_name || "N/A"}
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
                      {selectedUser?.email}
                    </Typography>
                  </Box>
                </Box>

                {/* Profile Picture Display */}
                {(selectedUser?.profile_picture ||
                  selectedUser?.profile_image ||
                  selectedUser?.logo) && (
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, color: "#2c3e50", fontWeight: 600 }}
                    >
                      {activeTab === 0
                        ? "Profile Picture"
                        : "Organization Logo"}
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        borderRadius: 2,
                        border: "2px solid rgba(102, 126, 234, 0.3)",
                        cursor: "pointer",
                        transition: "transform 0.2s ease-in-out",
                        display: "inline-block",
                        "&:hover": {
                          transform: "scale(1.02)",
                        },
                      }}
                      onClick={() => {
                        const fullImageUrl = buildImageUrl(
                          selectedUser.profile_picture ||
                            selectedUser.profile_image ||
                            selectedUser.logo
                        );
                        window.open(fullImageUrl, "_blank");
                      }}
                    >
                      <Box
                        component="img"
                        src={buildImageUrl(
                          selectedUser.profile_picture ||
                            selectedUser.profile_image ||
                            selectedUser.logo
                        )}
                        alt={
                          activeTab === 0
                            ? "Profile Picture"
                            : "Organization Logo"
                        }
                        sx={{
                          width: 150,
                          height: 150,
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "4px solid #667eea",
                          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <Box
                        textAlign="center"
                        sx={{
                          display: "none",
                          width: 150,
                          height: 150,
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          borderRadius: "50%",
                          border: "4px solid #667eea",
                        }}
                      >
                        <PersonIcon
                          sx={{
                            fontSize: 48,
                            color: "#667eea",
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#667eea",
                            display: "block",
                            wordBreak: "break-word",
                            textAlign: "center",
                          }}
                        >
                          {activeTab === 0
                            ? "Profile Picture"
                            : "Organization Logo"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <PersonIcon sx={{ fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {activeTab === 0 ? "ROLE" : "CONTACT PERSON"}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {activeTab === 0
                              ? selectedUser?.role?.replace("_", " ") || "N/A"
                              : selectedUser?.contact_person || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(78, 205, 196, 0.3)",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <PhoneIcon sx={{ fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            PHONE
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {activeTab === 0
                              ? selectedUser?.phone || "N/A"
                              : selectedUser?.phone_number || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(155, 89, 182, 0.3)",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <CheckCircle sx={{ fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            STATUS
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {activeTab === 0
                              ? selectedUser?.isActive
                                ? "Active"
                                : "Inactive"
                              : selectedUser?.status || "pending"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(243, 156, 18, 0.3)",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Schedule sx={{ fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            LAST LOGIN
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedUser?.lastLogin
                              ? new Date(
                                  selectedUser.lastLogin
                                ).toLocaleDateString()
                              : "Never"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* Additional Info Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#2c3e50" }}
                  >
                    Additional Information
                  </Typography>
                  <Grid container spacing={2}>
                    {activeTab === 0 ? (
                      <>
                        {/* Admin User Additional Info */}
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Department:</strong>{" "}
                            {selectedUser?.department || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Created:</strong>{" "}
                            {selectedUser?.createdAt
                              ? new Date(
                                  selectedUser.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Last Updated:</strong>{" "}
                            {selectedUser?.updatedAt
                              ? new Date(
                                  selectedUser.updatedAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {/* Event Organizer Additional Info */}
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Address:</strong>{" "}
                            {selectedUser?.address || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>KRA PIN:</strong>{" "}
                            {selectedUser?.kra_pin || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Bank Name:</strong>{" "}
                            {selectedUser?.bank_name || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Bank Account:</strong>{" "}
                            {selectedUser?.bank_account_number || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Website:</strong>{" "}
                            {selectedUser?.website ? (
                              <a
                                href={selectedUser.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#667eea",
                                  textDecoration: "none",
                                }}
                              >
                                {selectedUser.website}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Pesapal Merchant Ref:</strong>{" "}
                            {selectedUser?.pesapal_merchant_ref || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Created:</strong>{" "}
                            {selectedUser?.createdAt
                              ? new Date(
                                  selectedUser.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Last Updated:</strong>{" "}
                            {selectedUser?.updatedAt
                              ? new Date(
                                  selectedUser.updatedAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              </Box>
            ) : (
              // Create/Edit User Form
              <Box
                component="form"
                noValidate
                sx={{ maxHeight: "45vh", overflowY: "auto" }}
              >
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {activeTab === 0 ? (
                    <>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={userForm.name}
                        onChange={(e) =>
                          setUserForm({ ...userForm, name: e.target.value })
                        }
                        required
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) =>
                          setUserForm({ ...userForm, email: e.target.value })
                        }
                        required
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        value={userForm.phone}
                        onChange={(e) =>
                          setUserForm({ ...userForm, phone: e.target.value })
                        }
                        variant="outlined"
                        size="small"
                      />
                    </>
                  ) : (
                    <>
                      <TextField
                        fullWidth
                        label="Organization Name"
                        value={userForm.organization_name}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            organization_name: e.target.value,
                          })
                        }
                        required
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Contact Person"
                        value={userForm.contact_person}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            contact_person: e.target.value,
                          })
                        }
                        required
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) =>
                          setUserForm({ ...userForm, email: e.target.value })
                        }
                        required
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={userForm.phone_number}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            phone_number: e.target.value,
                          })
                        }
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Address"
                        value={userForm.address}
                        onChange={(e) =>
                          setUserForm({ ...userForm, address: e.target.value })
                        }
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="KRA PIN"
                        value={userForm.kra_pin}
                        onChange={(e) =>
                          setUserForm({ ...userForm, kra_pin: e.target.value })
                        }
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Bank Name"
                        value={userForm.bank_name}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            bank_name: e.target.value,
                          })
                        }
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Bank Account Number"
                        value={userForm.bank_account_number}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            bank_account_number: e.target.value,
                          })
                        }
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Website"
                        value={userForm.website}
                        onChange={(e) =>
                          setUserForm({ ...userForm, website: e.target.value })
                        }
                        variant="outlined"
                        size="small"
                      />
                    </>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Profile Picture
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="profile-picture-upload"
                      type="file"
                      onChange={handleProfilePictureChange}
                    />
                    <label htmlFor="profile-picture-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PersonIcon />}
                        sx={{
                          mb: 2,
                          borderColor: "#667eea",
                          color: "#667eea",
                          "&:hover": {
                            borderColor: "#5a6fd8",
                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                          },
                        }}
                      >
                        {userForm.profile_picture_preview
                          ? "Change Profile Picture"
                          : "Choose Profile Picture"}
                      </Button>
                    </label>
                    {userForm.profile_picture_preview && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Preview:
                        </Typography>
                        <Box
                          component="img"
                          src={userForm.profile_picture_preview}
                          alt="Profile preview"
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "2px solid #e0e0e0",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                  {activeTab === 0 && (
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={userForm.role}
                        onChange={(e) =>
                          setUserForm({ ...userForm, role: e.target.value })
                        }
                        label="Role"
                      >
                        <MenuItem value="super_admin">Super Admin</MenuItem>
                        <MenuItem value="project_manager">
                          Project Manager
                        </MenuItem>
                        <MenuItem value="engineer">Engineer</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  {openCreateDialog && (
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      required
                      variant="outlined"
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userForm.isActive}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            isActive: e.target.checked,
                          })
                        }
                        size="small"
                      />
                    }
                    label="Active User"
                  />
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
                setSelectedUser(null);
                setShowPassword(false);
                setUserForm({
                  name: "",
                  email: "",
                  phone: "",
                  role: "campaign_manager",
                  password: "",
                  isActive: true,
                });
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
            {(openEditDialog || openCreateDialog) && (
              <Button
                onClick={openEditDialog ? handleUpdateUser : handleCreateUser}
                variant="contained"
                startIcon={
                  isCreating || isUpdating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                  },
                  "&:disabled": {
                    background: "rgba(102, 126, 234, 0.3)",
                    color: "rgba(255, 255, 255, 0.6)",
                  },
                  transition: "all 0.3s ease",
                }}
                disabled={
                  activeTab === 0
                    ? !userForm.name ||
                      !userForm.email ||
                      (openCreateDialog && !userForm.password) ||
                      isCreating ||
                      isUpdating
                    : !userForm.organization_name ||
                      !userForm.contact_person ||
                      !userForm.email ||
                      (openCreateDialog && !userForm.password) ||
                      isCreating ||
                      isUpdating
                }
              >
                {isCreating
                  ? "Creating..."
                  : isUpdating
                  ? "Updating..."
                  : openEditDialog
                  ? "Update User"
                  : "Create Admin"}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UsersTable;
