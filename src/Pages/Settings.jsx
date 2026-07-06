import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  Button,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Check,
  Close,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { brand } from "../brandColors";
import {
  fieldSx,
  sectionCardSx,
  SectionHeader,
  outerPaperSx,
  pageHeaderSx,
} from "../components/Projects/projectFormUi";
import { saveButtonSx, cancelButtonSx } from "../components/Util/adminListUi";

export default function Settings({ user }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    Name: user?.full_name || "",
    Email: user?.email || "",
    PhoneNumber: user?.phone || "",
    Position: user?.position || "",
    Role: user?.role || "",
  });
  const [currentUser, setCurrentUser] = useState(user);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [severity, setSeverity] = useState("success");
  const [dloading, setDLoading] = useState(false);
  const [ploading, setPLoading] = useState(false);
  const [usr, setUsr] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false,
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const checkPasswordCriteria = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  useEffect(() => {
    checkPasswordCriteria(newPassword);
  }, [newPassword]);

  // Fetch fresh user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await fetch(`/api/admin-users/${user?.id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success && data.data) {
          setCurrentUser(data.data);
          // Only update userData if no signature is being uploaded
          setUserData((prevData) => ({
            Name: data.data.full_name || "",
            Email: data.data.email || "",
            PhoneNumber: data.data.phone || "",
            Position: data.data.position || "",
            Role: data.data.role || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  // Update password handler
  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setUsr(false);
    setMessage(null); // Clear previous messages

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setSeverity("error");
      return;
    }

    if (
      !passwordCriteria.digit ||
      !passwordCriteria.length ||
      !passwordCriteria.lowercase ||
      !passwordCriteria.special ||
      !passwordCriteria.uppercase
    ) {
      setMessage("Enter a strong password!");
      setSeverity("error");
      return;
    }

    setPLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No authentication token found");
        setSeverity("error");
        setPLoading(false);
        return;
      }

      const response = await fetch(`/api/admin-users/${user?.id}/password`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword: newPassword,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage("Password updated successfully.");
        setSeverity("success");
        // Clear message and redirect to home page after a short delay
        setTimeout(() => {
          setMessage(null);
          navigate("/");
        }, 2000); // 2 second delay to show the success message
      } else {
        setMessage(data.message || "Failed to update password.");
        setSeverity("error");
        // Clear error message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      setMessage("Failed to update password.");
      setSeverity("error");
      // Clear error message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
    setPLoading(false);
  };

  // Update user details handler
  const handleUserUpdate = async () => {
    setDLoading(true);
    setUsr(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No authentication token found");
        setSeverity("error");
        setDLoading(false);
        return;
      }

      // Prepare update data
      const updateData = {
        full_name: userData.Name,
        email: userData.Email,
        phone: userData.PhoneNumber,
        position: userData.Position,
        role: userData.Role,
      };

      const response = await fetch(`/api/admin-users/${user?.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();

      if (data.success) {
        // Update current user data with the response
        setCurrentUser(data.data);
        setMessage(data.message || "User details updated successfully.");
        setSeverity("success");
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        setMessage(data.message || "Failed to update user details.");
        setSeverity("error");
        // Clear error message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("Failed to update user details.");
      setSeverity("error");
      // Clear error message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
    setDLoading(false);
  };

  return (
    <Box>
      <Paper elevation={0} sx={outerPaperSx}>
        <Box sx={pageHeaderSx}>
          <Box sx={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", bgcolor: alpha("#fff", 0.06) }} />
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2} sx={{ position: "relative", zIndex: 1 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>Account Settings</Typography>
              <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.5 }}>Manage your profile and security settings</Typography>
            </Box>
            <Chip icon={<PersonIcon />} label={user?.role || "Admin"} sx={{ bgcolor: alpha("#fff", 0.15), color: "#fff", fontWeight: 600, border: `1px solid ${alpha("#fff", 0.25)}` }} />
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={sectionCardSx}>
              <SectionHeader icon={PersonIcon} title="Profile Information" />
              <Box sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  {[
                    { field: "Name", label: "Full Name", icon: <PersonIcon fontSize="small" />, disabled: false },
                    { field: "Email", label: "Email", icon: <EmailIcon fontSize="small" />, disabled: true },
                    { field: "PhoneNumber", label: "Phone Number", icon: <PhoneIcon fontSize="small" />, disabled: false },
                    { field: "Position", label: "Position", icon: <WorkIcon fontSize="small" />, disabled: false },
                    { field: "Role", label: "Role", icon: <WorkIcon fontSize="small" />, disabled: true },
                  ].map(({ field, label, icon, disabled }) => (
                    <FormControl key={field} fullWidth sx={fieldSx}>
                      <InputLabel>{label}</InputLabel>
                      <OutlinedInput
                        label={label}
                        value={userData[field] || ""}
                        disabled={disabled}
                        onChange={(e) => setUserData({ ...userData, [field]: e.target.value })}
                        startAdornment={<Box sx={{ mr: 1, color: brand.green, display: "flex" }}>{icon}</Box>}
                      />
                    </FormControl>
                  ))}
                  {usr && message && <Alert severity={severity}>{message}</Alert>}
                </Stack>
              </Box>
              <Box sx={{ p: 2.5, borderTop: `1px solid ${brand.sidebarBorder}`, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" onClick={handleUserUpdate} disabled={dloading} startIcon={dloading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} sx={saveButtonSx}>
                  {dloading ? "Updating..." : "Update Profile"}
                </Button>
              </Box>
            </Paper>

            <form onSubmit={handlePasswordUpdate}>
              <Paper elevation={0} sx={{ ...sectionCardSx, mb: 0 }}>
                <SectionHeader icon={SecurityIcon} title="Security Settings" color={brand.navy} />
                <Box sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: brand.sidebarBgAlt, border: `1px solid ${brand.sidebarBorder}` }}>
                      <Typography variant="subtitle2" fontWeight={700} color={brand.navy} mb={1} display="flex" alignItems="center" gap={1}>
                        <LockIcon fontSize="small" /> Password Requirements
                      </Typography>
                      <List dense>
                        {[
                          { key: "length", text: "At least 8 characters long" },
                          { key: "uppercase", text: "At least one uppercase letter" },
                          { key: "lowercase", text: "At least one lowercase letter" },
                          { key: "digit", text: "At least one digit" },
                          { key: "special", text: "At least one special character" },
                        ].map(({ key, text }) => (
                          <ListItem key={key} sx={{ py: 0.25, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {passwordCriteria[key] ? <Check sx={{ color: brand.green }} fontSize="small" /> : <Close sx={{ color: "#c62828" }} fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText primary={text} primaryTypographyProps={{ fontSize: "0.875rem", color: passwordCriteria[key] ? brand.greenDark : brand.sidebarTextMuted, fontWeight: passwordCriteria[key] ? 600 : 400 }} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <FormControl fullWidth sx={fieldSx}>
                      <InputLabel>Current Password</InputLabel>
                      <OutlinedInput
                        label="Current Password"
                        type={showPasswords.oldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        startAdornment={<Box sx={{ mr: 1, color: brand.green, display: "flex" }}><LockIcon fontSize="small" /></Box>}
                        endAdornment={
                          <Tooltip title={showPasswords.oldPassword ? "Hide" : "Show"}>
                            <IconButton onClick={() => togglePasswordVisibility("oldPassword")} edge="end" size="small"><Visibility fontSize="small" /></IconButton>
                          </Tooltip>
                        }
                      />
                    </FormControl>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={fieldSx}>
                          <InputLabel>New Password</InputLabel>
                          <OutlinedInput label="New Password" type={showPasswords.newPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={fieldSx}>
                          <InputLabel>Confirm Password</InputLabel>
                          <OutlinedInput
                            label="Confirm Password"
                            type={showPasswords.confirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setMessage(e.target.value !== newPassword ? "Passwords do not match" : "");
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>

                    {!usr && message && <Alert severity={severity}>{message}</Alert>}
                  </Stack>
                </Box>
                <Box sx={{ p: 2.5, borderTop: `1px solid ${brand.sidebarBorder}`, display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" type="submit" disabled={ploading} startIcon={ploading ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />} sx={saveButtonSx}>
                    {ploading ? "Updating..." : "Update Password"}
                  </Button>
                </Box>
              </Paper>
            </form>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
