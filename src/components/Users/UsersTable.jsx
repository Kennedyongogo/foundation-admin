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
import { useTheme, alpha } from "@mui/material/styles";
import Swal from "sweetalert2";
import { brand } from "../../brandColors";
import { fieldSx } from "../Projects/projectFormUi";
import {
  listPaperSx,
  ListPageHeader,
  createButtonSx,
  tabsSx,
  tabCountChipSx,
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
    full_name: "",
    email: "",
    phone: "",
    position: "",
    description: "",
    role: "admin",
    password: "",
    profile_picture: null,
    profile_picture_preview: "",
    profile_picture_path: "", // For storing the relative path
    isActive: true,
    whatsapp_link: "",
    google_link: "",
    twitter_link: "",
    facebook_link: "",
  });

  // Role tabs configuration
  const roleTabs = [
    { label: "All Users", value: null },
    { label: "Super Admins", value: "super-admin" },
    { label: "Admins", value: "admin" },
    { label: "Regular Users", value: "regular user" },
  ];

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

      // Add role filter if a specific role is selected
      const selectedRole = roleTabs[activeTab]?.value;
      if (selectedRole) {
        queryParams.append("role", selectedRole);
      }

      const response = await fetch(`/api/admin-users?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
        setTotalUsers(data.pagination?.total || 0);
      } else {
        setError("Failed to fetch users: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error fetching users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleStyle = (role) => {
    const styles = {
      "super-admin": { bg: alpha("#c62828", 0.1), color: "#c62828", border: alpha("#c62828", 0.3) },
      admin: { bg: alpha(brand.blue, 0.12), color: brand.blue, border: alpha(brand.blue, 0.35) },
      "regular user": { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, border: brand.sidebarBorder },
    };
    return styles[role] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, border: brand.sidebarBorder };
  };

  const getStatusStyle = (isActive) =>
    isActive
      ? { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Active" }
      : { bg: alpha("#c62828", 0.1), color: "#c62828", label: "Inactive" };

  const getRoleColor = (role) => {
    switch (role) {
      case "super-admin":
        return "error";
      case "admin":
        return "primary";
      case "regular user":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatRole = (role) => {
    if (!role) return "N/A";
    return role.replace("-", " ").replace(/_/g, " ").split(" ").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "error";
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

    // Convert file path to URL for display
    let profilePictureUrl = "";
    let profilePicturePath = "";
    if (user.profile_image) {
      profilePictureUrl = buildImageUrl(user.profile_image);
      profilePicturePath = user.profile_image; // Store the relative path
    }

    setUserForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      position: user.position || "",
      description: user.description || "",
      role: user.role || "admin",
      password: "",
      profile_picture: null,
      profile_picture_preview: profilePictureUrl,
      profile_picture_path: profilePicturePath, // Store the existing path
      isActive: user.isActive !== undefined ? user.isActive : true,
      whatsapp_link: user.whatsapp_link || "",
      google_link: user.google_link || "",
      twitter_link: user.twitter_link || "",
      facebook_link: user.facebook_link || "",
    });
    setOpenEditDialog(true);
  };

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${user.full_name}"?`,
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

        const response = await fetch(`/api/admin-users/${user.id}`, {
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

  const handleUpdateUser = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("full_name", userForm.full_name);
      formData.append("email", userForm.email);
      formData.append("phone", userForm.phone);
      formData.append("position", userForm.position);
      formData.append("description", userForm.description);
      formData.append("role", userForm.role);
      formData.append("isActive", userForm.isActive);
      formData.append("whatsapp_link", userForm.whatsapp_link);
      formData.append("google_link", userForm.google_link);
      formData.append("twitter_link", userForm.twitter_link);
      formData.append("facebook_link", userForm.facebook_link);

      // If a new file is selected, send the file
      // If no new file but there's an existing path, send the path
      if (userForm.profile_picture) {
        formData.append("profile_image", userForm.profile_picture);
      } else if (userForm.profile_picture_path) {
        formData.append("profile_image_path", userForm.profile_picture_path);
      }

      const response = await fetch(`/api/admin-users/${selectedUser.id}`, {
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
        full_name: "",
        email: "",
        phone: "",
        position: "",
        description: "",
        role: "admin",
        password: "",
        profile_picture: null,
        profile_picture_preview: "",
        profile_picture_path: "",
        isActive: true,
        whatsapp_link: "",
        google_link: "",
        twitter_link: "",
        facebook_link: "",
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
      formData.append("full_name", userForm.full_name);
      formData.append("email", userForm.email);
      formData.append("phone", userForm.phone);
      formData.append("position", userForm.position);
      formData.append("description", userForm.description);
      formData.append("role", userForm.role);
      formData.append("password", userForm.password);
      formData.append("isActive", userForm.isActive);
      formData.append("whatsapp_link", userForm.whatsapp_link);
      formData.append("google_link", userForm.google_link);
      formData.append("twitter_link", userForm.twitter_link);
      formData.append("facebook_link", userForm.facebook_link);

      if (userForm.profile_picture) {
        formData.append("profile_image", userForm.profile_picture);
      }

      const response = await fetch("/api/admin-users", {
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
        full_name: "",
        email: "",
        phone: "",
        position: "",
        description: "",
        role: "admin",
        password: "",
        profile_picture: null,
        profile_picture_preview: "",
        profile_picture_path: "",
        isActive: true,
        whatsapp_link: "",
        google_link: "",
        twitter_link: "",
        facebook_link: "",
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
    <Box>
      <Paper elevation={0} sx={listPaperSx}>
        <ListPageHeader
          icon={AdminIcon}
          title="Admin Users Management"
          subtitle="Manage admin users and their roles"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedUser(null);
                setShowPassword(false);
                setUserForm({
                  full_name: "",
                  email: "",
                  phone: "",
                  position: "",
                  description: "",
                  role: "admin",
                  password: "",
                  profile_picture: null,
                  profile_picture_preview: "",
                  profile_picture_path: "",
                  isActive: true,
                  whatsapp_link: "",
                  google_link: "",
                  twitter_link: "",
                  facebook_link: "",
                });
                setOpenCreateDialog(true);
              }}
              sx={createButtonSx}
            >
              Create New Admin
            </Button>
          }
        />

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box mb={3}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={tabsSx}
            >
              {roleTabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
          </Box>

          <TableContainer sx={tableContainerSx}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={tableHeadRowSx}>
                  <TableCell>No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
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
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <PersonIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2), mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, idx) => {
                    const roleStyle = getRoleStyle(user.role);
                    const statusStyle = getStatusStyle(user.isActive);
                    return (
                    <TableRow key={user.id} hover sx={tableRowSx}>
                      <TableCell sx={{ fontWeight: 700, color: brand.navy, width: 48 }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={brand.navy}>
                          {user.full_name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={brand.sidebarTextMuted}>
                          {user.position || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={brand.sidebarTextMuted}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatRole(user.role)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`,
                          }}
                        />
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
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View details" arrow>
                            <IconButton size="small" onClick={() => handleViewUser(user)} sx={actionButtonSx.view}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit user" arrow>
                            <IconButton size="small" onClick={() => handleEditUser(user)} sx={actionButtonSx.edit}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete user" arrow>
                            <IconButton size="small" onClick={() => handleDeleteUser(user)} sx={actionButtonSx.delete}>
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
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={paginationSx}
          />
        </Box>

        <Dialog
          open={openViewDialog || openEditDialog || openCreateDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setOpenEditDialog(false);
            setOpenCreateDialog(false);
            setSelectedUser(null);
            setShowPassword(false);
            setUserForm({
              full_name: "",
              email: "",
              phone: "",
              position: "",
              description: "",
              role: "admin",
              password: "",
              profile_picture: null,
              profile_picture_preview: "",
              profile_picture_path: "",
              isActive: true,
              whatsapp_link: "",
              google_link: "",
              twitter_link: "",
              facebook_link: "",
            });
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: dialogPaperSx }}
        >
          <BrandedDialogTitle
            icon={AdminIcon}
            title={openViewDialog ? "User Details" : openEditDialog ? "Edit User" : "Create New Admin"}
            subtitle={openViewDialog ? "View user information" : openEditDialog ? "Update user details" : "Add a new admin to the system"}
          />
          <DialogContent sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto", bgcolor: brand.sidebarBg }}>
            {openViewDialog ? (
              <Box>
                <Box sx={{ ...detailCardSx, mb: 3, mt: 1, bgcolor: alpha(brand.navy, 0.04) }}>
                  <Typography variant="h6" fontWeight={800} color={brand.navy}>
                    {selectedUser?.full_name || "N/A"}
                  </Typography>
                  <Typography variant="body2" color={brand.sidebarTextMuted} mt={0.5}>
                    {selectedUser?.email}
                  </Typography>
                </Box>

                {selectedUser?.profile_image && (
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Box
                      sx={{
                        display: "inline-block",
                        p: 1,
                        borderRadius: 2,
                        border: `2px solid ${brand.sidebarBorder}`,
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(buildImageUrl(selectedUser.profile_image), "_blank")}
                    >
                      <Box
                        component="img"
                        src={buildImageUrl(selectedUser.profile_image)}
                        alt="Profile"
                        sx={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }}
                      />
                    </Box>
                  </Box>
                )}

                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <DetailRow icon={PersonIcon} label="ROLE" value={formatRole(selectedUser?.role)} />
                  <DetailRow icon={PhoneIcon} label="PHONE" value={selectedUser?.phone || "N/A"} />
                  <DetailRow icon={CheckCircle} label="STATUS" value={selectedUser?.isActive ? "Active" : "Inactive"} />
                  <DetailRow
                    icon={Schedule}
                    label="LAST LOGIN"
                    value={selectedUser?.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : "Never"}
                  />
                </Stack>

                <Typography variant="subtitle2" fontWeight={700} color={brand.navy} mb={1.5}>
                  Additional Information
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Box sx={detailCardSx}>
                    <Typography variant="body2" color={brand.sidebarTextMuted}>
                      <strong>Position:</strong> {selectedUser?.position || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={detailCardSx}>
                    <Typography variant="body2" color={brand.sidebarTextMuted}>
                      <strong>Description:</strong> {selectedUser?.description || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={detailCardSx}>
                    <Typography variant="body2" color={brand.sidebarTextMuted}>
                      <strong>Created:</strong>{" "}
                      {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Box component="form" noValidate>
                <Stack spacing={2} sx={{ mt: 1 }}>
                      <TextField fullWidth label="Full Name" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} required size="small" sx={fieldSx} />
                      <TextField fullWidth label="Email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required size="small" sx={fieldSx} />
                      <TextField fullWidth label="Phone" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} size="small" sx={fieldSx} />
                      <TextField fullWidth label="Position" value={userForm.position} onChange={(e) => setUserForm({ ...userForm, position: e.target.value })} size="small" sx={fieldSx} />
                      <TextField fullWidth label="Description" value={userForm.description} onChange={(e) => setUserForm({ ...userForm, description: e.target.value })} size="small" multiline rows={3} sx={fieldSx} />
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
                          borderColor: brand.green,
                          color: brand.green,
                          "&:hover": { borderColor: brand.green, bgcolor: alpha(brand.green, 0.08) },
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
                    <FormControl fullWidth variant="outlined" size="small" sx={fieldSx}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={userForm.role}
                        onChange={(e) =>
                          setUserForm({ ...userForm, role: e.target.value })
                        }
                        label="Role"
                      >
                      <MenuItem value="super-admin">Super Admin</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="regular user">Regular User</MenuItem>
                      </Select>
                    </FormControl>
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
                  <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 600, color: brand.navy }}>
                    Social Media Links (Optional)
                  </Typography>
                  <TextField fullWidth label="WhatsApp Link" value={userForm.whatsapp_link} onChange={(e) => setUserForm({ ...userForm, whatsapp_link: e.target.value })} variant="outlined" size="small" placeholder="https://wa.me/..." sx={fieldSx} />
                  <TextField fullWidth label="Google Link" value={userForm.google_link} onChange={(e) => setUserForm({ ...userForm, google_link: e.target.value })} variant="outlined" size="small" sx={fieldSx} />
                  <TextField fullWidth label="Twitter Link" value={userForm.twitter_link} onChange={(e) => setUserForm({ ...userForm, twitter_link: e.target.value })} variant="outlined" size="small" sx={fieldSx} />
                  <TextField fullWidth label="Facebook Link" value={userForm.facebook_link} onChange={(e) => setUserForm({ ...userForm, facebook_link: e.target.value })} variant="outlined" size="small" sx={fieldSx} />
                </Stack>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={dialogActionsSx}>
            <Button
              onClick={() => {
                setOpenViewDialog(false);
                setOpenEditDialog(false);
                setOpenCreateDialog(false);
                setSelectedUser(null);
                setShowPassword(false);
                setUserForm({
                  full_name: "",
                  email: "",
                  phone: "",
                  position: "",
                  description: "",
                  role: "admin",
                  password: "",
                  profile_picture: null,
                  profile_picture_preview: "",
                  profile_picture_path: "",
                  isActive: true,
                  whatsapp_link: "",
                  google_link: "",
                  twitter_link: "",
                  facebook_link: "",
                });
              }}
              variant="outlined"
              sx={cancelButtonSx}
            >
              {openViewDialog ? "Close" : "Cancel"}
            </Button>
            {(openEditDialog || openCreateDialog) && (
              <Button
                onClick={openEditDialog ? handleUpdateUser : handleCreateUser}
                variant="contained"
                startIcon={isCreating || isUpdating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                sx={saveButtonSx}
                disabled={
                  !userForm.full_name ||
                  !userForm.email ||
                  (openCreateDialog && !userForm.password) ||
                  isCreating ||
                  isUpdating
                }
              >
                {isCreating ? "Creating…" : isUpdating ? "Updating…" : openEditDialog ? "Update User" : "Create Admin"}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UsersTable;
