import React, { Fragment, useEffect, useState } from "react";
import {
  People,
  Logout,
  ExpandLess,
  ExpandMore,
  PeopleAlt,
  Map,
  Dashboard,
  Settings,
  Warning,
  History,
  Assessment,
  RateReview,
  Favorite,
  Article,
  Business,
  Folder,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled, useTheme, alpha } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Box, Typography } from "@mui/material";
import Header from "./Header/Header";
import { brand, appBarGradient } from "../brandColors";

const drawerWidth = 280;
const drawerWidthMini = 96;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: drawerWidthMini,
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 64,
  padding: theme.spacing(1, 1.5),
  backgroundColor: brand.sidebarBgAlt,
  borderBottom: `1px solid ${brand.sidebarBorder}`,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: appBarGradient,
  boxShadow: `0 2px 16px ${alpha(brand.navyDark, 0.35)}`,
  borderBottom: `2px solid ${brand.gold}`,
  marginLeft: open ? drawerWidth : drawerWidthMini,
  width: `calc(100% - ${open ? drawerWidth : drawerWidthMini}px)`,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open ? openedMixin(theme) : closedMixin(theme)),
  "& .MuiDrawer-paper": {
    backgroundColor: brand.sidebarBg,
    borderRight: `1px solid ${brand.sidebarBorder}`,
    color: brand.sidebarText,
    overflowX: "hidden",
    boxSizing: "border-box",
    boxShadow: "2px 0 12px rgba(14, 59, 94, 0.06)",
    ...(open ? openedMixin(theme) : closedMixin(theme)),
    ...(!open && {
      whiteSpace: "normal",
      "& .MuiListItemButton-root": {
        whiteSpace: "normal",
      },
    }),
    "& .MuiListItemButton-root": {
      color: brand.sidebarText,
    },
    "& .MuiListItemText-primary": {
      color: `${brand.sidebarText} !important`,
    },
    "& .MuiListItemIcon-root": {
      color: `${brand.sidebarIcon} !important`,
    },
    "& .MuiListItemButton-root.Mui-selected": {
      backgroundColor: `${alpha(brand.green, 0.14)} !important`,
      color: `${brand.navy} !important`,
      "& .MuiListItemIcon-root": {
        color: `${brand.green} !important`,
      },
      "& .MuiListItemText-primary": {
        color: `${brand.navy} !important`,
        fontWeight: 700,
      },
    },
    "& .MuiListItemButton-root:hover": {
      backgroundColor: `${alpha(brand.navy, 0.06)} !important`,
    },
  },
}));

const isPathActive = (pathname, path) =>
  pathname === path || pathname.startsWith(`${path}/`);

const collapsedNavItemSx = (active) => ({
  mx: 0.5,
  mb: 0.5,
  borderRadius: 2,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  py: 1,
  px: 0.5,
  minHeight: 72,
  whiteSpace: "normal",
  textAlign: "center",
  color: brand.sidebarText,
  bgcolor: active ? alpha(brand.green, 0.14) : "transparent",
  borderLeft: "none",
  borderTop: active ? `3px solid ${brand.green}` : "3px solid transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    bgcolor: active ? alpha(brand.green, 0.18) : alpha(brand.navy, 0.06),
  },
  "& .MuiListItemIcon-root": {
    color: active ? `${brand.green} !important` : `${brand.sidebarIcon} !important`,
    minWidth: "auto",
    mb: 0.25,
    justifyContent: "center",
  },
  "& .MuiListItemText-root": {
    margin: 0,
    textAlign: "center",
  },
  "& .MuiListItemText-primary": {
    color: `${active ? brand.navy : brand.sidebarText} !important`,
    fontWeight: active ? 700 : 500,
    fontSize: "0.625rem",
    lineHeight: 1.2,
    whiteSpace: "normal",
    textAlign: "center",
  },
});

const navItemSx = (active) => ({
  mx: 1,
  mb: 0.5,
  borderRadius: 2,
  color: brand.sidebarText,
  bgcolor: active ? alpha(brand.green, 0.14) : "transparent",
  borderLeft: active ? `3px solid ${brand.green}` : "3px solid transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    bgcolor: active ? alpha(brand.green, 0.18) : alpha(brand.navy, 0.06),
  },
  "& .MuiListItemIcon-root": {
    color: active ? `${brand.green} !important` : `${brand.sidebarIcon} !important`,
    minWidth: 40,
  },
  "& .MuiListItemText-primary": {
    color: `${active ? brand.navy : brand.sidebarText} !important`,
    fontWeight: active ? 700 : 500,
    fontSize: "0.9rem",
  },
});

const subNavItemSx = (active) => ({
  mx: 1,
  mb: 0.25,
  pl: 3,
  borderRadius: 2,
  color: brand.sidebarTextMuted,
  bgcolor: active ? alpha(brand.blue, 0.1) : "transparent",
  borderLeft: active ? `3px solid ${brand.blue}` : "3px solid transparent",
  "&:hover": {
    bgcolor: alpha(brand.navy, 0.06),
  },
  "& .MuiListItemIcon-root": {
    color: active ? `${brand.blue} !important` : `${brand.sidebarTextMuted} !important`,
    minWidth: 36,
    "& .MuiSvgIcon-root": { fontSize: 20 },
  },
  "& .MuiListItemText-primary": {
    color: `${active ? brand.navy : brand.sidebarTextMuted} !important`,
    fontSize: "0.85rem",
    fontWeight: active ? 700 : 500,
  },
});

const Navbar = (props) => {
  const { user } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [open, setOpen] = useState(() => window.innerWidth >= theme.breakpoints.values.md);
  const [openSections, setOpenSections] = useState({
    Resources: true,
    System: false,
  });
  const [menuItems, setMenuItems] = useState([]);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleToggle = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
    fetch("/api/admin-users/logout", {
      method: "GET",
      credentials: "include",
    });
  };

  const adminItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/analytics" },
    { text: "Projects", icon: <Business />, path: "/projects" },
    { text: "Reports", icon: <Assessment />, path: "/reports" },
    { text: "Users", icon: <PeopleAlt />, path: "/users" },
    {
      text: "Resources",
      icon: <Folder />,
      subItems: [
        { text: "Documents", icon: <Folder />, path: "/documents" },
        { text: "Mission Categories", icon: <Favorite />, path: "/mission-categories" },
        { text: "Posts", icon: <Article />, path: "/posts" },
        { text: "Charity Map", icon: <Map />, path: "/map" },
        { text: "Issues", icon: <Warning />, path: "/issues" },
        { text: "Testimonies", icon: <RateReview />, path: "/testimonies" },
        { text: "Public Members", icon: <People />, path: "/public-members" },
      ],
    },
    {
      text: "System",
      icon: <Settings />,
      subItems: [
        { text: "Audit Trail", icon: <History />, path: "/audit" },
        { text: "Settings", icon: <Settings />, path: "/settings" },
      ],
    },
  ];

  useEffect(() => {
    if (user) setMenuItems(adminItems);
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= theme.breakpoints.values.md);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [theme.breakpoints.values.md]);

  const renderNavButton = (item, isSub = false) => {
    const active = isPathActive(location.pathname, item.path);
    const sx = !open
      ? collapsedNavItemSx(active)
      : isSub
        ? subNavItemSx(active)
        : navItemSx(active);

    return (
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => navigate(item.path)}
          selected={active}
          sx={sx}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          <Header
            setUser={props.setUser}
            handleDrawerOpen={handleDrawerOpen}
            open={open}
          />
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflow: "hidden",
              flex: 1,
              opacity: open ? 1 : 0,
              width: open ? "auto" : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <Box
              component="img"
              src="/foundation-logo-removebg-preview.png"
              alt="Mwalimu Hope Foundation"
              sx={{ height: 44, width: "auto", objectFit: "contain" }}
            />
            {open && (
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    color: brand.navy,
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    lineHeight: 1.2,
                    letterSpacing: "0.04em",
                  }}
                >
                  MWALIMU HOPE
                </Typography>
                <Typography
                  sx={{
                    color: brand.green,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  ADMIN PORTAL
                </Typography>
              </Box>
            )}
          </Box>
          {!open && (
            <Box
              component="img"
              src="/foundation-logo-removebg-preview.png"
              alt="MHF"
              sx={{
                height: 36,
                width: "auto",
                mx: "auto",
                objectFit: "contain",
              }}
            />
          )}
          <IconButton
            onClick={handleDrawerClose}
            size="small"
            sx={{
              color: brand.navy,
              bgcolor: alpha(brand.navy, 0.06),
              "&:hover": { bgcolor: alpha(brand.green, 0.12), color: brand.green },
              display: open ? "flex" : "none",
            }}
          >
            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>

        <List sx={{ flex: 1, py: 0.5 }}>
          {menuItems.map((item) => (
            <Fragment key={item.text}>
              {item.subItems ? (
                !open ? (
                  item.subItems.map((subItem) => (
                    <Fragment key={subItem.text}>
                      {renderNavButton(subItem, true)}
                    </Fragment>
                  ))
                ) : (
                    <>
                      <ListItem disablePadding sx={{ display: "block" }}>
                        <ListItemButton
                          onClick={() => handleToggle(item.text)}
                          sx={{
                            ...navItemSx(false),
                            cursor: "pointer",
                            "& .MuiSvgIcon-root:last-of-type": {
                              color: `${brand.navy} !important`,
                            },
                          }}
                        >
                          <ListItemIcon>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.text} />
                          {openSections[item.text] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                      </ListItem>
                      {openSections[item.text] && (
                        <List component="div" disablePadding>
                          {item.subItems.map((subItem) => (
                            <Fragment key={subItem.text}>
                              {renderNavButton(subItem, true)}
                            </Fragment>
                          ))}
                        </List>
                      )}
                    </>
                  )
              ) : (
                renderNavButton(item)
              )}
            </Fragment>
          ))}
        </List>

        <Divider sx={{ borderColor: brand.sidebarBorder, mx: 1.5 }} />

        <List sx={{ pb: 1.5 }}>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={logout}
              sx={{
                ...(!open ? collapsedNavItemSx(false) : {
                  mx: 1,
                  mt: 0.5,
                  borderRadius: 2,
                }),
                color: "#c62828",
                "&:hover": {
                  bgcolor: alpha("#c62828", 0.08),
                },
                "& .MuiListItemIcon-root": {
                  color: "#c62828 !important",
                  ...(!open ? { minWidth: "auto" } : { minWidth: 40 }),
                },
                "& .MuiListItemText-primary": {
                  color: "#c62828 !important",
                  fontWeight: 600,
                  ...(!open && {
                    fontSize: "0.625rem",
                    lineHeight: 1.2,
                    whiteSpace: "normal",
                    textAlign: "center",
                  }),
                },
              }}
            >
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default Navbar;
