import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Visibility,
  VisibilityOff,
  Email,
  Security,
} from "@mui/icons-material";
import Swal from "sweetalert2";

/** Public site palette — old paper / deep umber / morpho blue */
const BRAND = {
  oldPaper: "#F3EDE3",
  oldPaperSoft: "#F8F4EE",
  deepUmber: "#3A2415",
  deepUmberDark: "#2A1A0F",
  deepUmberMid: "#4A3224",
  morphoBlue: "#0077C8",
  morphoBlueDark: "#005A9C",
  morphoBlueMuted: "#5BA3D4",
  name: "Mwalimu Hope Foundation",
  tagline: "Empowering Communities, Restoring Hope, and Transforming Lives",
};

const LOGIN_IMAGES = [
  "/images/login-hero-1.jpg",
  "/images/login-hero-2.jpg",
  "/images/login-hero-3.jpg",
];

const REMEMBER_KEY = "mwalimu_admin_remember_email";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: "#fff",
    fontSize: "0.95rem",
    "& fieldset": { borderColor: alpha(BRAND.deepUmber, 0.18) },
    "&:hover fieldset": { borderColor: BRAND.morphoBlue },
    "&.Mui-focused fieldset": {
      borderColor: BRAND.morphoBlue,
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: BRAND.morphoBlueDark },
  "& .MuiInputBase-input": {
    py: 1.35,
    color: BRAND.deepUmber,
  },
};

export default function LoginPage() {
  const rfEmail = useRef();
  const rsEmail = useRef();
  const rfPassword = useRef();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    LOGIN_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved && rfEmail.current) {
      rfEmail.current.value = saved;
      setRememberMe(true);
    }
    const interval = setInterval(() => {
      setBgIndex((i) => (i + 1) % LOGIN_IMAGES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (email) =>
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  const validatePassword = (password) => password.length >= 6;

  const login = async (e) => {
    if (e) e.preventDefault();

    const email = rfEmail.current.value.toLowerCase().trim();
    const password = rfPassword.current.value;
    const body = { email, password };

    if (!validateEmail(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: BRAND.morphoBlue,
      });
      return;
    }

    if (!validatePassword(password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be at least 6 characters",
        confirmButtonColor: BRAND.morphoBlue,
      });
      return;
    }

    setLoading(true);
    Swal.fire({
      title: "Signing in...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch("/api/admin-users/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message,
          confirmButtonColor: BRAND.morphoBlue,
        });
      } else if (data.success) {
        if (rememberMe) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userRole", data.data.admin.role);
        localStorage.setItem("user", JSON.stringify(data.data.admin));
        setTimeout(() => navigate("/analytics"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message,
          confirmButtonColor: BRAND.morphoBlue,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Login failed. Please try again.",
        confirmButtonColor: BRAND.morphoBlue,
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    const d = { Email: rsEmail.current.value.toLowerCase().trim() };

    if (!validateEmail(d.Email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: BRAND.morphoBlue,
      });
      return;
    }

    setResetLoading(true);
    Swal.fire({
      title: "Processing...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(d),
      });
      const data = await response.json();

      if (response.ok) {
        setOpenResetDialog(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message,
          confirmButtonColor: BRAND.morphoBlue,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
          confirmButtonColor: BRAND.morphoBlue,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: BRAND.morphoBlue,
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        maxHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
        bgcolor: BRAND.oldPaperSoft,
        fontFamily: '"Plus Jakarta Sans", "Open Sans", system-ui, sans-serif',
        position: "relative",
      }}
    >
      {/* SVG clip defs — smooth cubic S-curve like the reference */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <defs>
          {/*
            Image right edge: bulges into the form at top & bottom,
            dips back toward the image in the middle (soft S / C wave).
          */}
          <clipPath id="mwalimu-hero-curve-desktop" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H0.92 C0.98,0.08 1,0.16 0.96,0.28 C0.9,0.42 0.78,0.48 0.8,0.58 C0.82,0.7 0.94,0.78 0.98,0.88 C1,0.94 0.96,0.98 0.92,1 H0 Z" />
          </clipPath>
          {/* Mobile: soft wave along the bottom of the image */}
          <clipPath id="mwalimu-hero-curve-mobile" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H1 V0.78 C0.9,0.86 0.78,0.92 0.62,0.94 C0.48,0.96 0.35,0.94 0.22,0.9 C0.12,0.86 0.05,0.82 0,0.78 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Left — hero with curved right edge */}
      <Box
        sx={{
          position: "relative",
          flex: { xs: "0 0 36%", md: "0 0 52%" },
          minHeight: 0,
          height: { xs: "36%", md: "100%" },
          overflow: "hidden",
          zIndex: 1,
          clipPath: {
            xs: "url(#mwalimu-hero-curve-mobile)",
            md: "url(#mwalimu-hero-curve-desktop)",
          },
          WebkitClipPath: {
            xs: "url(#mwalimu-hero-curve-mobile)",
            md: "url(#mwalimu-hero-curve-desktop)",
          },
        }}
      >
        {LOGIN_IMAGES.map((src, index) => (
          <Box
            key={src}
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: bgIndex === index ? 1 : 0,
              transform: bgIndex === index ? "scale(1.04)" : "scale(1)",
              transition: "opacity 1.6s ease-in-out, transform 7s ease-out",
            }}
          />
        ))}

        {/* Light bottom shade only — keeps photos clear */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, transparent 58%, ${alpha(BRAND.deepUmberDark, 0.42)} 100%)`,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            left: { xs: 16, md: 28 },
            bottom: { xs: 28, md: 40 },
            right: { xs: 16, md: 72 },
            zIndex: 2,
            display: { xs: "none", sm: "block" },
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 700,
              fontSize: { sm: "1.35rem", md: "1.75rem" },
              color: BRAND.oldPaperSoft,
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            Admin Portal
          </Typography>
          <Typography
            sx={{
              fontSize: { sm: "0.82rem", md: "0.92rem" },
              color: alpha(BRAND.oldPaperSoft, 0.85),
              lineHeight: 1.5,
              maxWidth: 360,
            }}
          >
            Secure access for Mwalimu Hope Foundation staff and board.
          </Typography>
        </Box>
      </Box>

      {/* Right — login form */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4, md: 5, lg: 7 },
          py: { xs: 2, md: 3 },
          bgcolor: BRAND.oldPaperSoft,
          overflow: "hidden",
          position: "relative",
          zIndex: 0,
          ml: { md: "-6%" },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src="/foundation-logo-removebg-preview.png"
            alt={BRAND.name}
            sx={{
              height: { xs: 64, sm: 76, md: 88 },
              width: "auto",
              objectFit: "contain",
              mb: { xs: 1, md: 1.25 },
            }}
          />
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 700,
              fontSize: { xs: "1.35rem", md: "1.55rem" },
              color: BRAND.deepUmber,
              textAlign: "center",
              lineHeight: 1.15,
              mb: 0.35,
            }}
          >
            {BRAND.name}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.78rem", md: "0.85rem" },
              color: BRAND.morphoBlueDark,
              textAlign: "center",
              fontWeight: 600,
              mb: { xs: 2.25, md: 3 },
              maxWidth: 320,
              lineHeight: 1.45,
            }}
          >
            {BRAND.tagline}
          </Typography>

          <Box component="form" onSubmit={login} sx={{ width: "100%" }}>
            <Typography
              component="label"
              htmlFor="admin-email"
              sx={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: BRAND.deepUmber,
                mb: 0.75,
              }}
            >
              Email{" "}
              <Box component="span" sx={{ color: "#c62828" }}>
                *
              </Box>
            </Typography>
            <TextField
              id="admin-email"
              inputRef={rfEmail}
              type="email"
              fullWidth
              placeholder="Enter your email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: alpha(BRAND.deepUmber, 0.45), fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 2 }}
            />

            <Typography
              component="label"
              htmlFor="admin-password"
              sx={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: BRAND.deepUmber,
                mb: 0.75,
              }}
            >
              Password{" "}
              <Box component="span" sx={{ color: "#c62828" }}>
                *
              </Box>
            </Typography>
            <TextField
              id="admin-password"
              inputRef={rfPassword}
              type={showPassword ? "text" : "password"}
              fullWidth
              placeholder="Enter password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      sx={{ color: alpha(BRAND.deepUmber, 0.5) }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 1.5 }}
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2.5 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      color: alpha(BRAND.deepUmber, 0.4),
                      "&.Mui-checked": { color: BRAND.morphoBlue },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.85rem", color: alpha(BRAND.deepUmber, 0.75) }}>
                    Remember me
                  </Typography>
                }
                sx={{ ml: -0.5, mr: 0 }}
              />
              <Link
                component="button"
                type="button"
                underline="always"
                onClick={() => setOpenResetDialog(true)}
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: BRAND.morphoBlue,
                  "&:hover": { color: BRAND.morphoBlueDark },
                }}
              >
                Forgot password?
              </Link>
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={loading}
                sx={{
                  width: { xs: "100%", sm: "72%" },
                  py: 1.35,
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  bgcolor: BRAND.deepUmber,
                  color: BRAND.oldPaperSoft,
                  boxShadow: `0 10px 28px ${alpha(BRAND.deepUmber, 0.35)}`,
                  "&:hover": {
                    bgcolor: BRAND.deepUmberDark,
                    boxShadow: `0 12px 32px ${alpha(BRAND.deepUmberDark, 0.4)}`,
                  },
                  "&.Mui-disabled": {
                    bgcolor: alpha(BRAND.deepUmber, 0.35),
                    color: alpha(BRAND.oldPaperSoft, 0.7),
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: BRAND.oldPaperSoft }} />
                ) : (
                  "Log in"
                )}
              </Button>
            </Box>
          </Box>

          <Typography
            sx={{
              mt: { xs: 2.5, md: 3.5 },
              fontSize: "0.7rem",
              color: alpha(BRAND.deepUmber, 0.45),
              textAlign: "center",
            }}
          >
            Developed by{" "}
            <Box component="span" sx={{ fontWeight: 700, color: alpha(BRAND.deepUmber, 0.7) }}>
              Carlvyne Technologies Ltd
            </Box>
          </Typography>
        </Box>
      </Box>

      {/* Reset password dialog */}
      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: BRAND.oldPaperSoft,
            border: `1px solid ${alpha(BRAND.deepUmber, 0.12)}`,
            boxShadow: `0 20px 48px ${alpha(BRAND.deepUmberDark, 0.22)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${BRAND.deepUmberDark} 0%, ${BRAND.deepUmber} 100%)`,
            color: BRAND.oldPaperSoft,
            fontWeight: 700,
            fontSize: "1.2rem",
            textAlign: "center",
            py: 2.5,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5}>
            <Security />
            <Box>Reset Password</Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3.5, pb: 2, bgcolor: "#fff" }}>
          <DialogContentText
            sx={{
              mb: 2.5,
              fontSize: "0.95rem",
              color: alpha(BRAND.deepUmber, 0.72),
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Enter your registered email address and we&apos;ll send you a secure link to reset your
            password.
          </DialogContentText>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            <TextField
              inputRef={rsEmail}
              type="email"
              label="Email Address"
              fullWidth
              margin="normal"
              placeholder="admin@mwalimuhope.org"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: alpha(BRAND.deepUmber, 0.5) }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            <DialogActions sx={{ mt: 3, gap: 1.5, px: 0 }}>
              <Button
                onClick={() => setOpenResetDialog(false)}
                variant="outlined"
                disabled={resetLoading}
                sx={{
                  borderColor: alpha(BRAND.deepUmber, 0.28),
                  color: BRAND.deepUmber,
                  borderRadius: "999px",
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={resetLoading}
                startIcon={
                  resetLoading ? <CircularProgress size={18} color="inherit" /> : <Security />
                }
                sx={{
                  bgcolor: BRAND.morphoBlue,
                  borderRadius: "999px",
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: `0 6px 18px ${alpha(BRAND.morphoBlue, 0.35)}`,
                  "&:hover": { bgcolor: BRAND.morphoBlueDark },
                }}
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
