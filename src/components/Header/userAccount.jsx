import React from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Avatar,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { brand } from "../../brandColors";
import {
  dialogPaperSx,
  BrandedDialogTitle,
  DetailRow,
  dialogActionsSx,
  cancelButtonSx,
  saveButtonSx,
} from "../Util/adminListUi";

const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
  if (imageUrl.startsWith("/uploads/")) return imageUrl;
  return imageUrl;
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatRole = (role) => {
  if (!role) return "Staff";
  if (role === "super-admin") return "Super Admin";
  if (role === "admin") return "Administrator";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export default function UserAccount({ open, onClose, currentUser }) {
  const navigate = useNavigate();
  const isActive = currentUser?.isActive !== false;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <BrandedDialogTitle
        icon={PersonIcon}
        title="My Account"
        subtitle="View your profile information"
      />

      <DialogContent sx={{ p: 3, bgcolor: brand.sidebarBg }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            p: 2.5,
            borderRadius: 2,
            bgcolor: brand.sidebarBgAlt,
            border: `1px solid ${brand.sidebarBorder}`,
            borderLeft: `4px solid ${brand.green}`,
          }}
        >
          {currentUser?.profile_image ? (
            <Avatar
              src={buildImageUrl(currentUser.profile_image)}
              alt={currentUser?.full_name}
              sx={{
                width: 64,
                height: 64,
                border: `3px solid ${alpha(brand.gold, 0.5)}`,
                boxShadow: `0 4px 12px ${alpha(brand.navy, 0.15)}`,
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: brand.green,
                fontWeight: 700,
                fontSize: "1.25rem",
                border: `3px solid ${alpha(brand.gold, 0.45)}`,
              }}
            >
              {getInitials(currentUser?.full_name)}
            </Avatar>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" fontWeight={700} color={brand.navy} noWrap>
              {currentUser?.full_name || "User"}
            </Typography>
            <Typography variant="body2" color={brand.sidebarTextMuted} noWrap sx={{ mb: 1 }}>
              {currentUser?.email}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={formatRole(currentUser?.role)}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  bgcolor: alpha(brand.navy, 0.08),
                  color: brand.navy,
                  border: `1px solid ${alpha(brand.navy, 0.15)}`,
                }}
              />
              <Chip
                label={isActive ? "Active" : "Inactive"}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  bgcolor: isActive ? alpha(brand.green, 0.12) : alpha("#c62828", 0.1),
                  color: isActive ? brand.greenDark : "#c62828",
                }}
              />
            </Stack>
          </Box>
        </Box>

        <Stack spacing={1.5}>
          <DetailRow icon={PersonIcon} label="Full Name" value={currentUser?.full_name || "—"} />
          <DetailRow icon={EmailIcon} label="Email" value={currentUser?.email || "—"} color={brand.blue} />
          <DetailRow
            icon={PhoneIcon}
            label="Phone Number"
            value={currentUser?.phone || "Not provided"}
          />
          {currentUser?.position && (
            <DetailRow icon={WorkIcon} label="Position" value={currentUser.position} />
          )}
          <DetailRow icon={WorkIcon} label="Role" value={formatRole(currentUser?.role)} color={brand.navy} />
          <DetailRow
            icon={ScheduleIcon}
            label="Last Login"
            value={
              currentUser?.lastLogin
                ? new Date(currentUser.lastLogin).toLocaleString()
                : "Current session"
            }
            color={brand.sidebarTextMuted}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={dialogActionsSx}>
        <Button onClick={onClose} variant="outlined" sx={cancelButtonSx}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<SettingsIcon />}
          sx={saveButtonSx}
          onClick={() => {
            onClose();
            navigate("/settings");
          }}
        >
          Account Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
