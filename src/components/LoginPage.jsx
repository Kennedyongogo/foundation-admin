// import "../Styles/login.scss";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Grid,
  Container,
  Stack,
  Divider,
  Fade,
  Slide,
  Zoom,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login,
  Security,
  Shield,
  VerifiedUser,
  AdminPanelSettings,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const images = ["/foundation1.jpg", "/foundation2.jpg", "/foundation3.jpg"];

export default function LoginPage(props) {
  const theme = useTheme();
  const rfEmail = useRef();
  const rsEmail = useRef();
  const rfPassword = useRef();
  const code = useRef();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [body, updateBody] = useState({
    email: null,
  });

  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [severity, setSeverity] = useState("error");
  const navigate = useNavigate();

  const login = async (e) => {
    if (e) e.preventDefault();

    let d = body;
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

    if (validateEmail(body.email) && validatePassword(body.password)) {
      setLoading(true);
      Swal.fire({
        title: "Signing in...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
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
        } else {
          // Check if login was successful
          if (data.success) {
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
            setTimeout(() => {
              navigate("/analytics");
            }, 1500);
          } else {
            Swal.fire({
              icon: "error",
              title: "Login Failed",
              text: data.message,
              confirmButtonColor: theme.palette.primary.main,
            });
          }
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Login failed. Please try again.",
          confirmButtonColor: theme.palette.primary.main,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const reset = async () => {
    let d = { Email: rsEmail.current.value.toLowerCase().trim() };

    if (!validateEmail(d.Email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    if (validateEmail(d.Email)) {
      setResetLoading(true);
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
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
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
          confirmButtonColor: theme.palette.primary.main,
        });
      } finally {
        setResetLoading(false);
      }
    }
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  useEffect(() => {
    let currentIndex = 0;
    const backgroundElement = document.querySelector(".login-background");

    // Preload images
    images.forEach((imageSrc) => {
      const img = new Image();
      img.src = imageSrc;
    });

    const changeBackground = () => {
      if (backgroundElement) {
        // Fade out current image
        backgroundElement.style.opacity = 0;

        setTimeout(() => {
          currentIndex = (currentIndex + 1) % images.length;
          backgroundElement.style.backgroundImage = `url(${images[currentIndex]})`;
          // Fade in new image
          backgroundElement.style.opacity = 1;
        }, 500);
      }
    };

    // Initial setup
    if (backgroundElement) {
      backgroundElement.style.transition = "opacity 1s ease-in-out";
      backgroundElement.style.opacity = 1;
    }

    const intervalId = setInterval(changeBackground, 5000); // Change every 5 seconds for testing

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      position="relative"
      sx={{ 
        overflow: "hidden",
        background: "transparent"
      }}
    >
      <div
        className="login-background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${images[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "opacity 1s ease-in-out",
          filter: "none",
        }}
      />
      
      {/* Animated geometric shapes for visual interest */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
            "50%": { transform: "translateY(-20px) rotate(180deg)" }
          }
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "8%",
          width: 80,
          height: 80,
          borderRadius: "20px",
          background: "linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          animation: "pulse 4s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.1)" }
          }
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            alignItems="center"
            justifyContent="center"
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <Fade in timeout={1000}>
                <Stack
                  spacing={4}
                  alignItems={{ xs: "center", md: "flex-start" }}
                >
                  <Slide direction="up" in timeout={1200}>
                    <Stack spacing={4} sx={{ textAlign: { xs: "center", md: "left" } }}>
                      {/* Logo with enhanced styling */}
                      <Box
                        sx={{
                          position: "relative",
                          display: "inline-block",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: -10,
                            left: -10,
                            right: -10,
                            bottom: -10,
                            background: "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                            borderRadius: "20px",
                            filter: "blur(10px)",
                            zIndex: -1,
                          }
                        }}
                      >
                        <Box
                          component="img"
                          src="/foundation-logo.png"
                          alt="Mwalimu Hope Foundation"
                          sx={{
                            height: { xs: 80, sm: 100, md: 120, lg: 140 },
                            width: "auto",
                            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4)) brightness(1.1)",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              transform: "scale(1.05) rotate(2deg)",
                              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5)) brightness(1.2)",
                            },
                          }}
                        />
                      </Box>

                      {/* Enhanced title with subtitle */}
                      <Stack spacing={2}>
                        <Typography
                          variant="h1"
                          sx={{
                            color: "#fff",
                            fontWeight: 900,
                            fontSize: {
                              xs: "1.8rem",
                              sm: "2.2rem",
                              md: "2.8rem",
                              lg: "3.2rem",
                            },
                            textAlign: { xs: "center", md: "left" },
                            letterSpacing: "0.5px",
                            background: `linear-gradient(135deg, 
                              rgba(255,255,255,0.95) 0%, 
                              rgba(255,255,255,0.8) 50%, 
                              rgba(255,255,255,0.9) 100%)`,
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 0 30px rgba(255,255,255,0.3)",
                            lineHeight: 1.2,
                            mb: 1,
                          }}
                        >
                          Mwalimu Hope Foundation
                        </Typography>
                        
                        <Typography
                          variant="h6"
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            fontWeight: 400,
                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                            textAlign: { xs: "center", md: "left" },
                            letterSpacing: "0.5px",
                            opacity: 0.9,
                            maxWidth: { md: "350px" },
                            lineHeight: 1.4,
                          }}
                        >
                          Empowering Minds, Restoring Hope
                        </Typography>

                      </Stack>
                    </Stack>
                  </Slide>
                </Stack>
              </Fade>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex", justifyContent: "center" }}
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
                      "&::before": {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <form onSubmit={login}>
                    {/* Enhanced header with admin icon */}
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
                      <AdminPanelSettings 
                        sx={{ 
                          color: "rgba(255,255,255,0.9)", 
                          fontSize: { xs: 24, sm: 28, md: 32 },
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                        }} 
                      />
                      <Typography
                        textAlign="center"
                        fontWeight="800"
                        color="white"
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
                            <Email sx={{ 
                              color: "rgba(255,255,255,0.7)",
                              transition: "all 0.3s ease",
                              fontSize: { xs: 20, sm: 24 },
                            }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
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
                            border: `2px solid rgba(255, 255, 255, 0.6)`,
                            boxShadow: `
                              0 0 0 4px rgba(255, 255, 255, 0.1),
                              0 8px 24px rgba(0, 0, 0, 0.2)
                            `,
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
                      }}
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
                            <Security sx={{ 
                              color: "rgba(255,255,255,0.7)",
                              transition: "all 0.3s ease",
                              fontSize: { xs: 20, sm: 24 },
                            }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ 
                                color: "rgba(255,255,255,0.7)",
                                transition: "all 0.3s ease",
                                p: { xs: 0.8, sm: 1 },
                                "&:hover": {
                                  color: "rgba(255,255,255,0.9)",
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  transform: "scale(1.1)",
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
                      sx={{
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
                            border: `2px solid rgba(255, 255, 255, 0.6)`,
                            boxShadow: `
                              0 0 0 4px rgba(255, 255, 255, 0.1),
                              0 8px 24px rgba(0, 0, 0, 0.2)
                            `,
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
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.8)"
                      align="center"
                      sx={{
                        mt: 2,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        fontWeight: 500,
                        "&:hover": {
                          color: "rgba(255,255,255,0.95)",
                          transform: "translateY(-1px)",
                          textShadow: "0 2px 8px rgba(255,255,255,0.3)",
                        },
                      }}
                      onClick={() => setOpenResetDialog(true)}
                    >
                      Forgot your password? 
                      <Box component="span" sx={{ 
                        color: "rgba(255,255,255,0.9)",
                        textDecoration: "underline",
                        ml: 0.5,
                        "&:hover": {
                          color: "white",
                        }
                      }}>
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
                          <CircularProgress size={{ xs: 20, sm: 24 }} color="inherit" />
                        ) : (
                          <Login sx={{ fontSize: { xs: 20, sm: 24 } }} />
                        )
                      }
                      sx={{
                        mt: { xs: 3, sm: 4 },
                        py: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: 3, sm: 4 },
                        background: `
                          linear-gradient(135deg, 
                            rgba(76, 175, 80, 0.9) 0%, 
                            rgba(56, 142, 60, 0.9) 50%, 
                            rgba(46, 125, 50, 0.9) 100%)
                        `,
                        boxShadow: `
                          0 8px 32px rgba(76, 175, 80, 0.3),
                          0 0 0 1px rgba(255, 255, 255, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        textTransform: "none",
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                          transition: "left 0.5s ease",
                        },
                        "&:hover": {
                          background: `
                            linear-gradient(135deg, 
                              rgba(76, 175, 80, 1) 0%, 
                              rgba(56, 142, 60, 1) 50%, 
                              rgba(46, 125, 50, 1) 100%)
                          `,
                          boxShadow: `
                            0 12px 48px rgba(76, 175, 80, 0.4),
                            0 0 0 1px rgba(255, 255, 255, 0.2),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3)
                          `,
                          transform: { xs: "translateY(-2px)", sm: "translateY(-3px) scale(1.02)" },
                          "&::before": {
                            left: "100%",
                          },
                        },
                        "&:active": {
                          transform: "translateY(-1px) scale(0.98)",
                        },
                        "&:disabled": {
                          background: "rgba(255, 255, 255, 0.1)",
                          color: "rgba(255, 255, 255, 0.5)",
                          transform: "none",
                          boxShadow: "none",
                          "&::before": {
                            display: "none",
                          },
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
          
          {/* Developed by Card */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 2, sm: 2.5, md: 3 } }}>
            <Fade in timeout={2000}>
              <Card
                sx={{
                  width: { xs: "auto", sm: "30%" },
                  minWidth: "fit-content",
                  background: "linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.9) 50%, rgba(46, 125, 50, 0.9) 100%)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(76, 175, 80, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 48px rgba(76, 175, 80, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                    borderColor: "rgba(255, 255, 255, 0.25)",
                    background: "linear-gradient(135deg, rgba(76, 175, 80, 1) 0%, rgba(56, 142, 60, 1) 50%, rgba(46, 125, 50, 1) 100%)",
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 0.75, sm: 1 }, "&:last-child": { pb: { xs: 0.75, sm: 1 } } }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: { xs: 0.5, md: 1 },
                      textAlign: "center",
                      flexWrap: "nowrap",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "white",
                        fontWeight: 600,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        whiteSpace: "nowrap",
                        display: "inline",
                      }}
                    >
                      Developed by
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "white",
                        fontWeight: 600,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        whiteSpace: "nowrap",
                        display: "inline",
                      }}
                    >
                      Carlvyne Technologies Ltd
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Container>
      </Box>

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
          }
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, 
              rgba(76, 175, 80, 0.9) 0%, 
              rgba(56, 142, 60, 0.9) 100%)`,
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
            Enter your registered email address and we'll send you a secure link to reset your password.
          </DialogContentText>
          <form
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
                sx={{
                  borderColor: "rgba(0,0,0,0.3)",
                  color: "rgba(0,0,0,0.7)",
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "rgba(0,0,0,0.5)",
                    backgroundColor: "rgba(0,0,0,0.05)",
                  },
                }}
                disabled={resetLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, 
                    rgba(76, 175, 80, 0.9) 0%, 
                    rgba(56, 142, 60, 0.9) 100%)`,
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                  "&:hover": {
                    background: `linear-gradient(135deg, 
                      rgba(76, 175, 80, 1) 0%, 
                      rgba(56, 142, 60, 1) 100%)`,
                    boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
                    transform: "translateY(-1px)",
                  },
                }}
                disabled={resetLoading}
                startIcon={resetLoading ? <CircularProgress size={18} color="inherit" /> : <Security />}
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
