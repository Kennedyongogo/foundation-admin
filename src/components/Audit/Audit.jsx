import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { brand } from "../../brandColors";
import { fieldSx, dateGridSx } from "../Projects/projectFormUi";
import {
  listPaperSx,
  ListPageHeader,
  tabsSx,
  tableContainerSx,
  tableHeadRowSx,
  tableRowSx,
  paginationSx,
  actionButtonSx,
  dialogPaperSx,
  BrandedDialogTitle,
  DetailRow,
  dialogActionsSx,
  cancelButtonSx,
  detailCardSx,
} from "../Util/adminListUi";

const Audit = () => {
  const theme = useTheme();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  const resourceTypes = [
    { value: "", label: "All" },
    { value: "admin_user", label: "Admin User" },
    { value: "project", label: "Project" },
    { value: "document", label: "Document" },
    { value: "inquiry", label: "Inquiry" },
    { value: "system", label: "System" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, [page, rowsPerPage, selectedTab]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      const selectedResourceType = resourceTypes[selectedTab].value;
      if (selectedResourceType) queryParams.append("resource_type", selectedResourceType);

      const response = await fetch(`/api/audit-trail?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAuditLogs(data.data || []);
        setTotalLogs(data.pagination?.total || 0);
      } else {
        setError(
          "Failed to fetch audit logs: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching audit logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action) => {
    if (action.includes("delete")) return { bg: alpha("#c62828", 0.1), color: "#c62828" };
    if (action.includes("create")) return { bg: alpha(brand.green, 0.14), color: brand.greenDark };
    if (action.includes("update") || action.includes("login")) return { bg: alpha(brand.blue, 0.12), color: brand.blue };
    return { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted };
  };

  const getStatusStyle = (status) => {
    const styles = {
      success: { bg: alpha(brand.green, 0.14), color: brand.greenDark, label: "Success" },
      failed: { bg: alpha("#c62828", 0.1), color: "#c62828", label: "Failed" },
      pending: { bg: alpha(brand.gold, 0.18), color: "#e65100", label: "Pending" },
    };
    return styles[status] || { bg: alpha(brand.navy, 0.08), color: brand.sidebarTextMuted, label: status };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getActionColor = (action) => {
    if (action.includes("delete")) return "error";
    if (action.includes("create")) return "success";
    if (action.includes("update") || action.includes("login")) return "info";
    return "default";
  };

  const formatActionText = (action) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatResourceType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setOpenViewDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0);
  };

  if (error && auditLogs.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={listPaperSx}>
        <ListPageHeader
          icon={HistoryIcon}
          title="Audit Trail Management"
          subtitle="View and track all system activities and changes"
        />

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box mb={3}>
            <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={tabsSx}>
              {resourceTypes.map((type) => (
                <Tab key={type.value || "all"} label={type.label} />
              ))}
            </Tabs>
          </Box>

          <TableContainer sx={tableContainerSx}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={tableHeadRowSx}>
                  <TableCell>No</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress sx={{ color: brand.green }} size={36} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                      <Button variant="contained" onClick={fetchAuditLogs} sx={{ bgcolor: brand.green, "&:hover": { bgcolor: brand.greenLight } }}>
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <HistoryIcon sx={{ fontSize: 48, color: alpha(brand.navy, 0.2), mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>No audit logs found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log, idx) => {
                    const actionStyle = getActionStyle(log.action);
                    const statusStyle = getStatusStyle(log.status);
                    return (
                    <TableRow key={log.id} hover sx={tableRowSx}>
                      <TableCell sx={{ fontWeight: 700, color: brand.navy, width: 48 }}>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={brand.navy}>{log.user?.full_name || "System"}</Typography>
                        <Typography variant="caption" color={brand.sidebarTextMuted}>{log.user?.email || "N/A"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={formatActionText(log.action)} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: actionStyle.bg, color: actionStyle.color }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={brand.sidebarTextMuted} fontWeight={500}>{formatResourceType(log.resource_type)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statusStyle.label} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: statusStyle.bg, color: statusStyle.color }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={brand.sidebarTextMuted} fontWeight={500}>{formatDate(log.createdAt)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View details" arrow>
                          <IconButton size="small" onClick={() => handleViewLog(log)} sx={actionButtonSx.view}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={totalLogs} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25, 50]} sx={paginationSx} />
        </Box>

        <Dialog open={openViewDialog} onClose={() => { setOpenViewDialog(false); setSelectedLog(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
          <BrandedDialogTitle icon={HistoryIcon} title="Audit Log Details" subtitle="View complete audit trail information" />
          <DialogContent sx={{ p: 3, bgcolor: brand.sidebarBg, maxHeight: "70vh", overflowY: "auto" }}>
            {selectedLog && (
              <Stack spacing={2}>
                <DetailRow icon={PersonIcon} label="USER" value={selectedLog.user?.full_name || "System"} />
                <Typography variant="caption" color={brand.sidebarTextMuted} sx={{ mt: -1, ml: 5 }}>{selectedLog.user?.email || "N/A"}</Typography>
                <Box sx={dateGridSx}>
                  <Box>
                    <Typography variant="caption" color={brand.sidebarTextMuted} fontWeight={600}>ACTION</Typography>
                    <Chip label={formatActionText(selectedLog.action)} size="small" sx={{ mt: 0.5, fontWeight: 600, ...getActionStyle(selectedLog.action), bgcolor: getActionStyle(selectedLog.action).bg }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color={brand.sidebarTextMuted} fontWeight={600}>STATUS</Typography>
                    <Chip label={getStatusStyle(selectedLog.status).label} size="small" sx={{ mt: 0.5, fontWeight: 600, bgcolor: getStatusStyle(selectedLog.status).bg, color: getStatusStyle(selectedLog.status).color }} />
                  </Box>
                </Box>
                <DetailRow label="RESOURCE TYPE" value={formatResourceType(selectedLog.resource_type)} />
                <Box sx={detailCardSx}>
                  <Typography variant="caption" color={brand.sidebarTextMuted} fontWeight={600}>RESOURCE ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all", mt: 0.5 }}>{selectedLog.resource_id || "N/A"}</Typography>
                </Box>
                <Box sx={detailCardSx}>
                  <Typography variant="caption" color={brand.sidebarTextMuted} fontWeight={600}>DESCRIPTION</Typography>
                  <Typography variant="body2" color={brand.navy} sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>{selectedLog.description}</Typography>
                </Box>
                <DetailRow label="IP ADDRESS" value={selectedLog.ip_address || "N/A"} />
                <DetailRow icon={ScheduleIcon} label="DATE & TIME" value={formatDate(selectedLog.createdAt)} />
                {selectedLog.old_values && (
                  <Box sx={{ ...detailCardSx, bgcolor: alpha("#c62828", 0.04), borderColor: alpha("#c62828", 0.2) }}>
                    <Typography variant="caption" color={brand.sidebarTextMuted} fontWeight={600}>OLD VALUES</Typography>
                    <pre style={{ margin: "8px 0 0", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(selectedLog.old_values, null, 2)}</pre>
                  </Box>
                )}
                {selectedLog.new_values && (
                  <Box sx={{ ...detailCardSx, bgcolor: alpha(brand.green, 0.04), borderColor: alpha(brand.green, 0.2) }}>
                    <Typography variant="caption" color={brand.sidebarTextMuted} fontWeight={600}>NEW VALUES</Typography>
                    <pre style={{ margin: "8px 0 0", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(selectedLog.new_values, null, 2)}</pre>
                  </Box>
                )}
                {selectedLog.error_message && <Alert severity="error">{selectedLog.error_message}</Alert>}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={dialogActionsSx}>
            <Button onClick={() => { setOpenViewDialog(false); setSelectedLog(null); }} variant="outlined" sx={cancelButtonSx}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Audit;
