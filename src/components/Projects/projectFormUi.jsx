import { Box, Typography, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { brand } from "../../brandColors";

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: brand.sidebarBgAlt,
    "& fieldset": { borderColor: brand.sidebarBorder },
    "&:hover fieldset": { borderColor: alpha(brand.green, 0.5) },
    "&.Mui-focused fieldset": {
      borderColor: brand.green,
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: brand.green,
    fontWeight: 600,
  },
};

export const sectionCardSx = {
  bgcolor: brand.sidebarBg,
  border: `1px solid ${brand.sidebarBorder}`,
  borderRadius: 2,
  boxShadow: "none",
  mb: 3,
  overflow: "hidden",
};

export const dateGridSx = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 2,
  width: "100%",
};

export const SectionHeader = ({ icon: Icon, title, color = brand.green }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 3,
      py: 2,
      bgcolor: alpha(color, 0.08),
      borderBottom: `1px solid ${brand.sidebarBorder}`,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: alpha(color, 0.15),
        color,
      }}
    >
      <Icon fontSize="small" />
    </Box>
    <Typography variant="h6" fontWeight={700} color={brand.navy} fontSize="1rem">
      {title}
    </Typography>
  </Box>
);

export const categoryOptions = [
  { value: "volunteer", label: "Volunteer Program", color: brand.green },
  { value: "education", label: "Education", color: brand.navy },
  { value: "mental_health", label: "Mental Health", color: brand.blue },
  { value: "community", label: "Community Development", color: brand.greenLight },
  { value: "donation", label: "Donation Drive", color: brand.gold },
  { value: "partnership", label: "Partnership", color: brand.blueLight },
];

export const outerPaperSx = {
  borderRadius: 3,
  overflow: "hidden",
  border: `1px solid ${brand.sidebarBorder}`,
  boxShadow: "0 4px 24px rgba(14, 59, 94, 0.08)",
  bgcolor: brand.sidebarBg,
};

export const pageHeaderSx = {
  background: `linear-gradient(90deg, ${brand.navyDark} 0%, ${brand.navy} 55%, ${brand.navyLight} 100%)`,
  px: { xs: 2, sm: 3 },
  py: { xs: 2.5, sm: 3 },
  color: "#fff",
  borderBottom: `3px solid ${brand.gold}`,
  position: "relative",
  overflow: "hidden",
};

export const missionCategoryOptions = [
  { value: "educational_support", label: "Educational Support", color: brand.blue },
  { value: "mental_health_awareness", label: "Mental Health Awareness", color: "#e91e63" },
  { value: "poverty_alleviation", label: "Poverty Alleviation", color: brand.green },
  { value: "community_empowerment", label: "Community Empowerment", color: brand.gold },
  { value: "healthcare_access", label: "Healthcare Access", color: "#9c27b0" },
  { value: "youth_development", label: "Youth Development", color: brand.blueLight },
];

export const getMissionCategoryLabel = (category) =>
  missionCategoryOptions.find((o) => o.value === category)?.label || category;

export const getMissionCategoryColor = (category) =>
  missionCategoryOptions.find((o) => o.value === category)?.color || brand.navy;

export const imageGridSx = (imageCount) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${Math.min(Math.max(imageCount, 1), 4)}, 1fr)`,
  gap: 2,
  width: "100%",
});

/** 1–4 images per row; each row uses its own column count (matches project view). */
export const ImageGridRows = ({ items, renderItem }) => {
  if (!items?.length) return null;

  const maxPerRow = 4;
  const rows = [];
  for (let i = 0; i < items.length; i += maxPerRow) {
    rows.push(items.slice(i, i + maxPerRow));
  }

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {rows.map((row, rowIdx) => (
        <Box
          key={rowIdx}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(row.length, maxPerRow)}, 1fr)`,
            gap: 2,
            width: "100%",
          }}
        >
          {row.map((item, colIdx) => renderItem(item, rowIdx * maxPerRow + colIdx))}
        </Box>
      ))}
    </Stack>
  );
};
