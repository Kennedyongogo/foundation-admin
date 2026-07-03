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
  Card,
  Grid,
  Container,
  Stack,
  Divider,
  Fade,
  Slide,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Login,
  Security,
  AdminPanelSettings,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const images = ["/foundation1.jpg", "/foundation2.jpg", "/foundation3.jpg"];

const darkFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: { xs: 3, sm: 4 },
    border: "1px solid rgba(255, 255, 255, 0.15)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(10px)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      border: "2px solid rgba(255, 255, 255, 0.6)",
      boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.2)",
      transform: "translateY(-2px)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: 500,
    fontSize: { xs: "0.9rem", sm: "1rem" },
    "&.Mui-focused": {
      color: "rgba(255, 255, 255, 0.95)",
    },
  },
  "& .MuiInputBase-input": {
    color: "white",
    fontWeight: 400,
    fontSize: { xs: "0.9rem", sm: "1rem" },
    py: { xs: 1.2, sm: 1.5 },
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
      opacity: 1,
      fontSize: { xs: "0.85rem", sm: "0.9rem" },
    },
  },
};

export default function LoginPage() {
  const theme = useTheme();
  const rfEmail = useRef();
  const rsEmail = useRef();
  const rfPassword = useRef();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [body, updateBody] = useState({ email: null });
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    if (e) e.preventDefault();

    const d = body;
    d.email = rfEmail.current.value.toLowerCase().trim();
    d.password = rfPassword.current.value;
    updateBody(d);

    if (!validateEmail(body.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    if (!validatePassword(body.password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be at least 6 characters",
        confirmButtonColor: theme.palette.primary.main,
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
          confirmButtonColor: theme.palette.primary.main,
        });
      } else if (data.success) {
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
          confirmButtonColor: theme.palette.primary.main,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Login failed. Please try again.",
        confirmButtonColor: theme.palette.primary.main,
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
        confirmButtonColor: theme.palette.primary.main,
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
          confirmButtonColor: theme.palette.primary.main,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
          confirmButtonColor: theme.palette.primary.main,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: theme.palette.primary.main,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const validateEmail = (email) =>
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  const validatePassword = (password) => password.length >= 6;

  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const interval = setInterval(() => {
      setBgIndex((i) => (i + 1) % images.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      position="relative"
      sx={{ overflow: "hidden", bgcolor: "#0a1628" }}
    >
      {/* Cinematic background slideshow */}
      {images.map((src, index) => (
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
            transform: bgIndex === index ? "scale(1.06)" : "scale(1)",
            transition: "opacity 1.8s ease-in-out, transform 7s ease-out",
            willChange: "opacity, transform",
          }}
        />
      ))}

      {/* Layered overlays for depth & readability */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(115deg, rgba(6, 28, 18, 0.92) 0%, rgba(10, 40, 28, 0.75) 42%, rgba(8, 20, 40, 0.55) 100%),
            radial-gradient(ellipse at 15% 50%, rgba(14, 141, 69, 0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 20%, rgba(33, 150, 243, 0.2) 0%, transparent 45%)
          `,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Slideshow indicators */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          bottom: { xs: 72, sm: 80 },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        {images.map((_, i) => (
          <Box
            key={i}
            onClick={() => setBgIndex(i)}
            role="button"
            tabIndex={0}
            aria-label={`Background image ${i + 1}`}
            onKeyDown={(e) => e.key === "Enter" && setBgIndex(i)}
            sx={{
              width: bgIndex === i ? 28 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: bgIndex === i ? "#40a86c" : "rgba(255,255,255,0.35)",
              cursor: "pointer",
              transition: "all 0.35s ease",
              "&:hover": { bgcolor: "rgba(255,255,255,0.7)" },
            }}
          />
        ))}
      </Stack>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          width: "100%",
          py: { xs: 3, sm: 4 },
        }}
      >
        <Container
          maxWidth={false}
          sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4, lg: 8, xl: 12 } }}
        >
          <Grid
            container
            spacing={{ xs: 4, md: 5, lg: 6 }}
            alignItems="center"
            justifyContent={{ xs: "center", lg: "space-between" }}
          >
            {/* Brand panel */}
            <Grid
              size={{ xs: 12, lg: "auto" }}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", lg: "flex-start" },
                pl: { lg: 2, xl: 4 },
              }}
            >
              <Fade in timeout={900}>
                <Stack
                  spacing={3}
                  alignItems={{ xs: "center", lg: "flex-start" }}
                >
                  <Box sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        inset: "-20%",
                        background: "radial-gradient(circle, rgba(14,141,69,0.25) 0%, transparent 70%)",
                        filter: "blur(20px)",
                      }}
                    />
                    <Box
                      component="img"
                      src="/foundation-logo-removebg-preview.png"
                      alt="Mwalimu Hope Foundation"
                      sx={{
                        position: "relative",
                        height: { xs: 180, sm: 220, md: 260, lg: 300 },
                        width: "auto",
                        maxWidth: { xs: "80vw", sm: 320, lg: 380 },
                        objectFit: "contain",
                        filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.45))",
                      }}
                    />
                  </Box>
                </Stack>
              </Fade>
            </Grid>

            {/* Login card */}
            <Grid
              size={{ xs: 12, md: 6, lg: "auto" }}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", lg: "flex-end" },
                pr: { lg: 2, xl: 4 },
              }}
            >
              <Slide direction="left" in timeout={1500}>
                <Card
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    maxWidth: { xs: "100%", sm: 450, md: 480 },
                    width: "100%",
                    borderRadius: { xs: 4, sm: 6 },
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: `
                      0 20px 40px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    mx: { xs: 1, sm: 0 },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover": {
                      transform: { xs: "translateY(-2px)", sm: "translateY(-4px)", md: "translateY(-8px) scale(1.02)" },
                      boxShadow: `
                        0 32px 64px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(255, 255, 255, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `,
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      "&::before": { opacity: 1 },
                    },
                  }}
                >
                  <form onSubmit={login}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={{ xs: 1.5, sm: 2 }}
                      sx={{ mb: { xs: 3, sm: 4 } }}
                    >
                      <AdminPanelSettings
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: { xs: 24, sm: 28, md: 32 },
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        }}
                      />
                      <Typography
                        textAlign="center"
                        fontWeight="800"
                        variant="h4"
                        sx={{
                          textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
                          letterSpacing: "1px",
                          color: "white",
                          fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                        }}
                      >
                        Admin Portal
                      </Typography>
                    </Stack>

                    <TextField
                      inputRef={rfEmail}
                      type="email"
                      label="Email Address"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      placeholder="admin@mwalimuhope.org"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: 20, sm: 24 } }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={darkFieldSx}
                    />

                    <TextField
                      inputRef={rfPassword}
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      placeholder="Enter your secure password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Security sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: 20, sm: 24 } }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{
                                color: "rgba(255,255,255,0.7)",
                                p: { xs: 0.8, sm: 1 },
                                "&:hover": {
                                  color: "rgba(255,255,255,0.9)",
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                },
                              }}
                            >
                              {showPassword ? (
                                <VisibilityOff sx={{ fontSize: { xs: 20, sm: 22 } }} />
                              ) : (
                                <Visibility sx={{ fontSize: { xs: 20, sm: 22 } }} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={darkFieldSx}
                    />

                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.8)"
                      align="center"
                      sx={{
                        mt: 2,
                        cursor: "pointer",
                        fontWeight: 500,
                        "&:hover": { color: "rgba(255,255,255,0.95)" },
                      }}
                      onClick={() => setOpenResetDialog(true)}
                    >
                      Forgot your password?
                      <Box
                        component="span"
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          textDecoration: "underline",
                          ml: 0.5,
                        }}
                      >
                        Reset here
                      </Box>
                    </Typography>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Login sx={{ fontSize: { xs: 20, sm: 24 } }} />
                        )
                      }
                      sx={{
                        mt: { xs: 3, sm: 4 },
                        py: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: 3, sm: 4 },
                        background: `linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.9) 50%, rgba(46, 125, 50, 0.9) 100%)`,
                        boxShadow: "0 8px 32px rgba(76, 175, 80, 0.3)",
                        textTransform: "none",
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                        fontWeight: 700,
                        "&:hover": {
                          background: `linear-gradient(135deg, rgba(76, 175, 80, 1) 0%, rgba(56, 142, 60, 1) 50%, rgba(46, 125, 50, 1) 100%)`,
                          boxShadow: "0 12px 48px rgba(76, 175, 80, 0.4)",
                          transform: { xs: "translateY(-2px)", sm: "translateY(-3px) scale(1.02)" },
                        },
                        "&:disabled": {
                          background: "rgba(255, 255, 255, 0.1)",
                          color: "rgba(255, 255, 255, 0.5)",
                        },
                      }}
                    >
                      {loading ? "Authenticating..." : "Access Admin Portal"}
                    </Button>
                  </form>
                </Card>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer credit */}
      <Box
        sx={{
          flexShrink: 0,
          py: { xs: 1.5, sm: 2 },
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Fade in timeout={1200}>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "0.75rem",
              letterSpacing: "0.03em",
            }}
          >
            Developed by{" "}
            <Box
              component="span"
              sx={{
                color: "rgba(255,255,255,0.85)",
                fontWeight: 600,
              }}
            >
              Carlvyne Technologies Ltd
            </Box>
          </Typography>
        </Fade>
      </Box>

      {/* Reset password dialog */}
      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Slide}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.9) 100%)`,
            color: "white",
            fontWeight: 700,
            fontSize: "1.3rem",
            letterSpacing: "0.5px",
            textAlign: "center",
            py: 3,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <Security sx={{ fontSize: 28 }} />
            <Box>Reset Password</Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <DialogContentText
            sx={{
              mb: 3,
              fontSize: "1rem",
              color: "rgba(0,0,0,0.7)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Enter your registered email address and we&apos;ll send you a secure link to reset your password.
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
                    <Email sx={{ color: "rgba(0,0,0,0.6)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(76, 175, 80, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(76, 175, 80, 1)",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "rgba(76, 175, 80, 1)",
                },
              }}
            />
            <DialogActions sx={{ mt: 4, gap: 2, px: 0 }}>
              <Button
                onClick={() => setOpenResetDialog(false)}
                variant="outlined"
                disabled={resetLoading}
                sx={{
                  borderColor: "rgba(0,0,0,0.3)",
                  color: "rgba(0,0,0,0.7)",
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={resetLoading}
                startIcon={
                  resetLoading ? <CircularProgress size={18} color="inherit" /> : <Security />
                }
                sx={{
                  background: `linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.9) 100%)`,
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
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
