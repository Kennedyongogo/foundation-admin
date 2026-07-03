import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  ListItemIcon,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ArrowDropDown as ArrowDropDownIcon,
  AccountCircle as AccountCircleIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  AdminPanelSettings,
} from "@mui/icons-material";
import UserAccount from "./userAccount";
import EditUserDetails from "./editUserDetails";
import ChangePassword from "./changePassword";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { brand } from "../../brandColors";

const LoadingScreen = () => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#fff",
      zIndex: 1300,
    }}
  >
    <CircularProgress sx={{ color: brand.green }} />
  </Box>
);

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

export default function Header(props) {
  const [currentUser, setCurrentUser] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [toggleAccount, setToggleAccount] = useState(false);
  const [toggleEditDetails, setToggleEditDetails] = useState(false);
  const [toggleChangePass, setToggleChangePass] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
      props.setUser(userData);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
    fetch("/api/admin/logout", {
      method: "GET",
      credentials: "include",
    });
  };

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const roleLabel =
    currentUser?.role === "super-admin"
      ? "Super Admin"
      : currentUser?.role === "admin"
        ? "Administrator"
        : "Staff";

  return (
    <>
      {loading && <LoadingScreen />}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          color: "#fff",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <IconButton
            aria-label="Open navigation"
            onClick={props.handleDrawerOpen}
            edge="start"
            sx={{
              color: "#fff",
              bgcolor: alpha("#fff", 0.08),
              border: `1px solid ${alpha("#fff", 0.12)}`,
              ...(props.open && { display: "none" }),
              "&:hover": {
                bgcolor: alpha(brand.gold, 0.25),
                borderColor: alpha(brand.gold, 0.4),
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {!props.open && (
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1.25,
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src="/foundation-logo-removebg-preview.png"
                alt="Mwalimu Hope Foundation"
                sx={{ height: 38, width: "auto", objectFit: "contain" }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    lineHeight: 1.2,
                    letterSpacing: "0.02em",
                  }}
                >
                  Admin Portal
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.72rem",
                    color: alpha("#fff", 0.72),
                    fontWeight: 500,
                  }}
                >
                  Mwalimu Hope Foundation
                </Typography>
              </Box>
            </Box>
          )}

          {props.open && (
            <Chip
              icon={<AdminPanelSettings sx={{ fontSize: 16, color: `${brand.gold} !important` }} />}
              label="Foundation Administration"
              size="small"
              sx={{
                display: { xs: "none", md: "flex" },
                bgcolor: alpha("#fff", 0.1),
                color: "#fff",
                border: `1px solid ${alpha(brand.gold, 0.35)}`,
                fontWeight: 600,
                fontSize: "0.75rem",
                "& .MuiChip-label": { px: 1 },
              }}
            />
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          onClick={handleClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: { xs: 0.75, sm: 1.25 },
            py: 0.5,
            borderRadius: 3,
            cursor: "pointer",
            bgcolor: alpha("#fff", 0.08),
            border: `1px solid ${alpha("#fff", 0.14)}`,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: alpha("#fff", 0.14),
              borderColor: alpha(brand.gold, 0.45),
            },
          }}
        >
          <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
            <Typography
              noWrap
              sx={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.2, maxWidth: 160 }}
            >
              {currentUser?.full_name}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: brand.gold, fontWeight: 600 }}>
              {roleLabel}
            </Typography>
          </Box>

          {currentUser?.profile_image ? (
            <Avatar
              src={buildImageUrl(currentUser.profile_image)}
              alt={currentUser?.full_name}
              sx={{
                width: 36,
                height: 36,
                border: `2px solid ${alpha(brand.gold, 0.6)}`,
                boxShadow: `0 2px 8px ${alpha(brand.navyDark, 0.4)}`,
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: brand.green,
                border: `2px solid ${alpha(brand.gold, 0.5)}`,
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {getInitials(currentUser?.full_name)}
            </Avatar>
          )}

          <ArrowDropDownIcon sx={{ color: alpha("#fff", 0.85), fontSize: 22 }} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 2.5,
              border: `1px solid ${alpha(brand.navy, 0.08)}`,
              overflow: "hidden",
              "& .MuiMenuItem-root": {
                py: 1.25,
                fontSize: "0.9rem",
                fontWeight: 500,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(brand.navy, 0.04) }}>
            <Typography fontWeight={700} fontSize="0.9rem" color={brand.navy}>
              {currentUser?.full_name}
            </Typography>
            <Typography fontSize="0.75rem" color="text.secondary">
              {currentUser?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setToggleAccount(true);
              handleClose();
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" sx={{ color: brand.green }} />
            </ListItemIcon>
            My account
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate("/settings");
              handleClose();
            }}
          >
            <ListItemIcon>
              <LockIcon fontSize="small" sx={{ color: brand.blue }} />
            </ListItemIcon>
            Change password
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              logout();
              handleClose();
            }}
            sx={{ color: "#c62828" }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#c62828" }} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {currentUser && (
          <UserAccount
            onClose={() => setToggleAccount(false)}
            open={toggleAccount}
            currentUser={currentUser}
          />
        )}
        {currentUser && (
          <EditUserDetails
            open={toggleEditDetails}
            onClose={() => setToggleEditDetails(false)}
            currentUser={currentUser}
          />
        )}
        {currentUser && (
          <ChangePassword
            open={toggleChangePass}
            onClose={() => setToggleChangePass(false)}
            currentUser={currentUser}
          />
        )}
      </Box>
    </>
  );
}
