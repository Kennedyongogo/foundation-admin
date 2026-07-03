import { createTheme } from "@mui/material/styles";
import { brand } from "./brandColors";

const theme = createTheme({
  palette: {
    primary: {
      main: brand.green,
      light: brand.greenLight,
      dark: brand.greenDark,
    },
    secondary: {
      main: brand.gold,
      light: brand.goldLight,
      dark: "#f57f17",
    },
    info: {
      main: brand.blue,
      light: brand.blueLight,
      dark: "#005a9e",
    },
    background: {
      default: "#f4f7f9",
      paper: "#ffffff",
    },
    text: {
      primary: brand.navy,
      secondary: "#5a6b7d",
    },
    success: {
      main: brand.green,
      light: brand.greenLight,
      dark: brand.greenDark,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
