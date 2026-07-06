import { Box, Typography, Stack, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { brand, appBarGradient } from "../../brandColors";

export { brand, appBarGradient };

export const listPaperSx = {
  borderRadius: 3,
  overflow: "hidden",
  border: `1px solid ${brand.sidebarBorder}`,
  boxShadow: "0 4px 24px rgba(14, 59, 94, 0.08)",
  bgcolor: brand.sidebarBg,
};

export const listHeaderSx = {
  background: appBarGradient,
  px: { xs: 2, sm: 3 },
  py: { xs: 2.5, sm: 3 },
  color: "#fff",
  borderBottom: `3px solid ${brand.gold}`,
  position: "relative",
  overflow: "hidden",
};

export const headerDecorCircleSx = {
  position: "absolute",
  top: -40,
  right: -40,
  width: 160,
  height: 160,
  borderRadius: "50%",
  bgcolor: alpha("#fff", 0.06),
};

export const headerIconBoxSx = {
  width: 52,
  height: 52,
  borderRadius: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: alpha("#fff", 0.12),
  border: `1px solid ${alpha(brand.gold, 0.45)}`,
};

export const createButtonSx = {
  bgcolor: brand.green,
  borderRadius: 2,
  px: 3,
  py: 1.25,
  fontWeight: 700,
  textTransform: "none",
  boxShadow: `0 6px 20px ${alpha(brand.green, 0.45)}`,
  width: { xs: "100%", sm: "auto" },
  "&:hover": {
    bgcolor: brand.greenLight,
    boxShadow: `0 8px 24px ${alpha(brand.green, 0.5)}`,
    transform: "translateY(-1px)",
  },
};

export const tabsSx = {
  minHeight: 44,
  "& .MuiTabs-indicator": {
    backgroundColor: brand.green,
    height: 3,
    borderRadius: "3px 3px 0 0",
  },
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    minHeight: 44,
    color: brand.sidebarTextMuted,
    "&.Mui-selected": { color: brand.navy },
    "&:hover": { color: brand.green, bgcolor: alpha(brand.green, 0.06) },
  },
};

export const tabCountChipSx = (active) => ({
  height: 22,
  minWidth: 22,
  fontWeight: 700,
  fontSize: "0.7rem",
  bgcolor: active ? brand.green : alpha(brand.navy, 0.08),
  color: active ? "#fff" : brand.sidebarTextMuted,
});

export const tableContainerSx = {
  borderRadius: 2,
  overflowX: "auto",
  border: `1px solid ${brand.sidebarBorder}`,
  "&::-webkit-scrollbar": { height: 6 },
  "&::-webkit-scrollbar-thumb": {
    bgcolor: alpha(brand.navy, 0.25),
    borderRadius: 3,
  },
};

export const tableHeadRowSx = {
  bgcolor: brand.navy,
  "& .MuiTableCell-head": {
    color: "#fff",
    fontWeight: 700,
    fontSize: { xs: "0.75rem", sm: "0.8rem" },
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: `2px solid ${brand.gold}`,
    py: 1.75,
    whiteSpace: "nowrap",
  },
};

export const tableRowSx = {
  "&:nth-of-type(even)": { bgcolor: brand.sidebarBgAlt },
  "&:hover": { bgcolor: alpha(brand.green, 0.06) },
  "& .MuiTableCell-root": {
    fontSize: { xs: "0.8rem", sm: "0.875rem" },
    py: { xs: 1.25, sm: 1.75 },
    borderColor: brand.sidebarBorder,
  },
};

export const paginationSx = {
  borderTop: `1px solid ${brand.sidebarBorder}`,
  "& .MuiTablePagination-toolbar": { color: brand.navy },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    color: brand.sidebarTextMuted,
    fontWeight: 500,
  },
  "& .MuiIconButton-root": {
    color: brand.navy,
    "&.Mui-disabled": { color: alpha(brand.navy, 0.3) },
  },
};

export const actionButtonSx = {
  view: {
    color: brand.green,
    bgcolor: alpha(brand.green, 0.1),
    borderRadius: 1.5,
    "&:hover": { bgcolor: alpha(brand.green, 0.2) },
  },
  edit: {
    color: brand.blue,
    bgcolor: alpha(brand.blue, 0.1),
    borderRadius: 1.5,
    "&:hover": { bgcolor: alpha(brand.blue, 0.18) },
  },
  delete: {
    color: "#c62828",
    bgcolor: alpha("#c62828", 0.08),
    borderRadius: 1.5,
    "&:hover": { bgcolor: alpha("#c62828", 0.15) },
  },
};

export const filterBarSx = {
  p: 2,
  bgcolor: brand.sidebarBgAlt,
  borderBottom: `1px solid ${brand.sidebarBorder}`,
};

export const dialogPaperSx = {
  borderRadius: 3,
  overflow: "hidden",
  border: `1px solid ${brand.sidebarBorder}`,
  boxShadow: "0 12px 40px rgba(14, 59, 94, 0.15)",
  maxHeight: "90vh",
};

export const dialogTitleSx = {
  background: appBarGradient,
  color: "#fff",
  borderBottom: `3px solid ${brand.gold}`,
  p: 2.5,
  position: "relative",
  overflow: "hidden",
};

export const dialogActionsSx = {
  p: 2.5,
  gap: 1.5,
  bgcolor: brand.sidebarBgAlt,
  borderTop: `1px solid ${brand.sidebarBorder}`,
};

export const saveButtonSx = {
  bgcolor: brand.green,
  borderRadius: 2,
  px: 3,
  py: 1,
  fontWeight: 700,
  textTransform: "none",
  boxShadow: `0 4px 15px ${alpha(brand.green, 0.35)}`,
  "&:hover": {
    bgcolor: brand.greenLight,
    boxShadow: `0 6px 20px ${alpha(brand.green, 0.4)}`,
  },
  "&:disabled": {
    bgcolor: alpha(brand.navy, 0.12),
    color: alpha(brand.navy, 0.4),
    boxShadow: "none",
  },
};

export const cancelButtonSx = {
  borderRadius: 2,
  px: 3,
  py: 1,
  fontWeight: 600,
  textTransform: "none",
  color: brand.navy,
  borderColor: brand.sidebarBorder,
  "&:hover": {
    borderColor: brand.navy,
    bgcolor: alpha(brand.navy, 0.04),
  },
};

export const detailCardSx = {
  bgcolor: brand.sidebarBg,
  border: `1px solid ${brand.sidebarBorder}`,
  borderRadius: 2,
  p: 2,
  transition: "box-shadow 0.2s ease",
  "&:hover": { boxShadow: `0 4px 12px ${alpha(brand.navy, 0.08)}` },
};

export const ListPageHeader = ({ icon: Icon, title, subtitle, action }) => (
  <Box sx={listHeaderSx}>
    <Box sx={headerDecorCircleSx} />
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      gap={2}
      position="relative"
      zIndex={1}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {Icon && (
          <Box sx={headerIconBoxSx}>
            <Icon sx={{ fontSize: 28, color: brand.gold }} />
          </Box>
        )}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.5, color: alpha("#fff", 0.9) }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {action}
    </Box>
  </Box>
);

export const BrandedDialogTitle = ({ icon: Icon, title, subtitle }) => (
  <Box sx={dialogTitleSx}>
    <Box
      sx={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: "50%",
        bgcolor: alpha("#fff", 0.06),
      }}
    />
    <Stack direction="row" spacing={2} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
      {Icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha("#fff", 0.12),
            border: `1px solid ${alpha(brand.gold, 0.45)}`,
          }}
        >
          <Icon sx={{ fontSize: 24, color: brand.gold }} />
        </Box>
      )}
      <Box>
        <Typography variant="h6" fontWeight={800} fontSize="1.1rem">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </Box>
);

export const DetailRow = ({ icon: Icon, label, value, color = brand.green }) => (
  <Box sx={detailCardSx}>
    <Box display="flex" alignItems="center" gap={2}>
      {Icon && <Icon sx={{ fontSize: 22, color }} />}
      <Box>
        <Typography variant="caption" sx={{ color: brand.sidebarTextMuted, fontWeight: 600, letterSpacing: "0.04em" }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, color: brand.navy, mt: 0.25 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  </Box>
);
