import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { Tabs, Tab } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

const PublicMembers = () => {
  const theme = useTheme();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    national_id: "",
    physical_address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    membership_type: "Regular",
    how_heard_about: "",
    reason_for_joining: "",
    areas_of_interest: "",
    skills_contribution: "",
    preferred_communication: "",
    status: "Pending",
  });
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMembers, setTotalMembers] = useState(0);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    Pending: 0,
    Active: 0,
    Inactive: 0,
    Rejected: 0,
  });

  // Status tabs configuration
  const statusTabs = [
    { label: "All Members", value: "all", count: tabCounts.all },
    { label: "Pending", value: "Pending", count: tabCounts.Pending },
    { label: "Active", value: "Active", count: tabCounts.Active },
    { label: "Inactive", value: "Inactive", count: tabCounts.Inactive },
    { label: "Rejected", value: "Rejected", count: tabCounts.Rejected },
  ];

  useEffect(() => {
    fetchMembers();
  }, [page, rowsPerPage, activeTab]);

  // Fetch all members for tab counts on component mount and when activeTab changes
  useEffect(() => {
    fetchAllMembersForCounts();
  }, [activeTab]);

  const fetchMembers = async () => {
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

      const currentStatus = statusTabs[activeTab]?.value;
      if (currentStatus && currentStatus !== "all") {
        queryParams.append("status", currentStatus);
      }

      const response = await fetch(`/api/members?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMembers(data.data || []);
        setTotalMembers(data.pagination?.total || 0);
        // Update tab counts after fetching members to reflect any new members
        fetchAllMembersForCounts();
      } else {
        setError("Failed to fetch members: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error fetching members: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembersForCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/members?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        updateTabCounts(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching member counts:", err);
    }
  };

  const updateTabCounts = (membersData) => {
    const counts = {
      all: 0,
      Pending: 0,
      Active: 0,
      Inactive: 0,
      Rejected: 0,
    };

    membersData.forEach((member) => {
      counts.all++;
      if (counts.hasOwnProperty(member.status)) {
        counts[member.status]++;
      }
    });

    setTabCounts(counts);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Active":
        return "success";
      case "Inactive":
        return "default";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getMembershipTypeColor = (type) => {
    switch (type) {
      case "Regular":
        return "primary";
      case "Lifetime":
        return "success";
      case "Student":
        return "info";
      case "Corporate":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleViewMember = (member) => {
    try {
      setSelectedMember(member);
      setOpenViewDialog(true);
    } catch (error) {
      console.error("Error in handleViewMember:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to open view dialog. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    }
  };

  const handleEditMember = (member) => {
    try {
      setSelectedMember(member);
      
      // Safely handle date_of_birth
      let dateOfBirth = "";
      if (member.date_of_birth) {
        try {
          const date = new Date(member.date_of_birth);
          if (!isNaN(date.getTime())) {
            dateOfBirth = date.toISOString().split("T")[0];
          }
        } catch (dateError) {
          console.error("Error parsing date:", dateError);
          dateOfBirth = "";
        }
      }
      
      setMemberForm({
        full_name: member.full_name || "",
        email: member.email || "",
        phone: member.phone || "",
        date_of_birth: dateOfBirth,
        gender: member.gender || "",
        national_id: member.national_id || "",
        physical_address: member.physical_address || "",
        emergency_contact_name: member.emergency_contact_name || "",
        emergency_contact_phone: member.emergency_contact_phone || "",
        membership_type: member.membership_type || "Regular",
        how_heard_about: member.how_heard_about || "",
        reason_for_joining: member.reason_for_joining || "",
        areas_of_interest: member.areas_of_interest || "",
        skills_contribution: member.skills_contribution || "",
        preferred_communication: member.preferred_communication || "",
        status: member.status || "Pending",
      });
      setOpenEditDialog(true);
    } catch (error) {
      console.error("Error in handleEditMember:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to open edit dialog. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    }
  };

  const handleUpdateMember = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const memberData = {
        full_name: memberForm.full_name,
        email: memberForm.email,
        phone: memberForm.phone,
        date_of_birth: memberForm.date_of_birth || null,
        gender: memberForm.gender || null,
        national_id: memberForm.national_id || null,
        physical_address: memberForm.physical_address || null,
        emergency_contact_name: memberForm.emergency_contact_name || null,
        emergency_contact_phone: memberForm.emergency_contact_phone || null,
        membership_type: memberForm.membership_type,
        how_heard_about: memberForm.how_heard_about || null,
        reason_for_joining: memberForm.reason_for_joining || null,
        areas_of_interest: memberForm.areas_of_interest || null,
        skills_contribution: memberForm.skills_contribution || null,
        preferred_communication: memberForm.preferred_communication || null,
        status: memberForm.status,
      };

      const response = await fetch(`/api/members/${selectedMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update member");
      }

      // Reset form and close dialog
      setOpenEditDialog(false);
      setSelectedMember(null);
      setMemberForm({
        full_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        national_id: "",
        physical_address: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        membership_type: "Regular",
        how_heard_about: "",
        reason_for_joining: "",
        areas_of_interest: "",
        skills_contribution: "",
        preferred_communication: "",
        status: "Pending",
      });

      // Refresh members list
      fetchMembers();
      fetchAllMembersForCounts();

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Member has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error updating member:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update member. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (memberId, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/members/${memberId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update member status");
      }

      // Refresh members list
      fetchMembers();
      fetchAllMembersForCounts();

      Swal.fire({
        icon: "success",
        title: "Status Updated!",
        text: `Member status has been updated to ${newStatus}.`,
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error updating member status:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update member status. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (member) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${member.full_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        container: "swal-z-index-fix",
      },
      didOpen: () => {
        const swalContainer = document.querySelector(".swal-z-index-fix");
        if (swalContainer) {
          swalContainer.style.zIndex = "9999";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(`/api/members/${member.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete member");
        }

        // Refresh members list
        fetchMembers();
        fetchAllMembersForCounts();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Member has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } catch (err) {
        console.error("Error deleting member:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete member. Please try again.",
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "none",
          boxShadow: "none",
          minHeight: "100vh",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={{ xs: 2, sm: 0 }}
            position="relative"
            zIndex={1}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                Public Members Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage members registered from the public portal
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content Section */}
        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: "calc(100vh - 200px)" }}
        >
          {/* Status Tabs */}
          <Box mb={3}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#667eea",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  minHeight: 48,
                  color: "#666",
                  "&.Mui-selected": {
                    color: "#667eea",
                  },
                  "&:hover": {
                    color: "#667eea",
                    backgroundColor: "rgba(102, 126, 234, 0.04)",
                  },
                },
              }}
            >
              {statusTabs.map((tab, index) => (
                <Tab
                  key={tab.value}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{tab.label}</span>
                      <Chip
                        label={tab.count}
                        size="small"
                        sx={{
                          backgroundColor:
                            activeTab === index ? "#667eea" : "#e0e0e0",
                          color: activeTab === index ? "white" : "#666",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 20,
                          minWidth: 20,
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Members Table */}
          <TableContainer
            sx={{
              borderRadius: 3,
              overflowX: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(102, 126, 234, 0.3)",
                borderRadius: 4,
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.5)",
                },
              },
            }}
          >
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "& .MuiTableCell-head": {
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "0.8rem", sm: "0.95rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      border: "none",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>No</TableCell>
                  <TableCell>Member Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: "#667eea" }} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="error" variant="h6">
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No members found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member, idx) => (
                    <TableRow
                      key={member.id}
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "rgba(102, 126, 234, 0.02)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(102, 126, 234, 0.08)",
                          transform: { xs: "none", sm: "scale(1.01)" },
                        },
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "& .MuiTableCell-root": {
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          padding: { xs: "8px 4px", sm: "16px" },
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#667eea" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{ color: "#2c3e50" }}
                        >
                          {member.full_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon
                            sx={{ color: "#3498db", fontSize: 18 }}
                          />
                          <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                            {member.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.status}
                          color={getStatusColor(member.status)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Member Details" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewMember(member);
                              }}
                              sx={{
                                color: "#27ae60",
                                backgroundColor: "rgba(39, 174, 96, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(39, 174, 96, 0.2)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Member" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMember(member);
                              }}
                              sx={{
                                color: "#3498db",
                                backgroundColor: "rgba(52, 152, 219, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(52, 152, 219, 0.2)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Member" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMember(member);
                              }}
                              sx={{
                                color: "#e74c3c",
                                backgroundColor: "rgba(231, 76, 60, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(231, 76, 60, 0.2)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalMembers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderTop: "1px solid rgba(102, 126, 234, 0.1)",
              "& .MuiTablePagination-toolbar": {
                color: "#667eea",
                fontWeight: 600,
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "#2c3e50",
                  fontWeight: 600,
                },
            }}
          />
        </Box>

        {/* View Member Dialog */}
        <Dialog
          open={openViewDialog && !!selectedMember}
          onClose={() => {
            setOpenViewDialog(false);
            setSelectedMember(null);
          }}
          maxWidth={false}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              maxHeight: "90vh",
              maxWidth: "50%",
              width: "50%",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              overflow: "hidden",
            },
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <PersonIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Member Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                View complete member information
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}>
            {selectedMember ? (
              <Box>
                {/* Member Header Section */}
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 3,
                    p: 3,
                    mb: 4,
                    mt: 2,
                    position: "relative",
                    overflow: "hidden",
                    color: "white",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {selectedMember.full_name}
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip
                      label={selectedMember.member_number || "N/A"}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={selectedMember.membership_type}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={selectedMember.status}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                {/* Member Details Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {/* Contact Information */}
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <EmailIcon sx={{ fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedMember.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <PhoneIcon sx={{ fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Phone
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedMember.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* Additional Information */}
                <Box
                  sx={{
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#667eea",
                      mb: 2,
                    }}
                  >
                    Additional Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Date of Birth
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedMember.date_of_birth)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Gender
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.gender || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        National ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.national_id || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Physical Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.physical_address || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Emergency Contact Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.emergency_contact_name || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Emergency Contact Phone
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.emergency_contact_phone || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Preferred Communication
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.preferred_communication || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        How Heard About
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.how_heard_about || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Reason for Joining
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.reason_for_joining || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Areas of Interest
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.areas_of_interest || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Skills Contribution
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMember.skills_contribution || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Registered On
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedMember.createdAt
                          ? (() => {
                              try {
                                const date = new Date(selectedMember.createdAt);
                                return !isNaN(date.getTime()) 
                                  ? date.toLocaleString() 
                                  : "N/A";
                              } catch (e) {
                                return "N/A";
                              }
                            })()
                          : "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No member data available
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => {
                setOpenViewDialog(false);
                setSelectedMember(null);
              }}
              variant="outlined"
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                "&:hover": {
                  borderColor: "#5a6fd8",
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              Close
            </Button>
            {selectedMember && (
              <>
                <Button
                  onClick={() => {
                    setOpenViewDialog(false);
                    handleEditMember(selectedMember);
                  }}
                  variant="contained"
                  sx={{
                    backgroundColor: "#3498db",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    "&:hover": {
                      backgroundColor: "#2980b9",
                    },
                  }}
                >
                  Edit Member
                </Button>
                {selectedMember.status === "Pending" && (
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedMember.id, "Active");
                      setOpenViewDialog(false);
                      setSelectedMember(null);
                    }}
                    variant="contained"
                    sx={{
                      backgroundColor: "#27ae60",
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      "&:hover": {
                        backgroundColor: "#229954",
                      },
                    }}
                  >
                    Approve
                  </Button>
                )}
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog
          open={openEditDialog && !!selectedMember}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedMember(null);
            setMemberForm({
              full_name: "",
              email: "",
              phone: "",
              date_of_birth: "",
              gender: "",
              national_id: "",
              physical_address: "",
              emergency_contact_name: "",
              emergency_contact_phone: "",
              membership_type: "Regular",
              how_heard_about: "",
              reason_for_joining: "",
              areas_of_interest: "",
              skills_contribution: "",
              preferred_communication: "",
              status: "Pending",
            });
          }}
          maxWidth={false}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              maxHeight: "90vh",
              maxWidth: "50%",
              width: "50%",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              overflow: "hidden",
            },
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
            }}
          >
            <EditIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Edit Member
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Update member information
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}>
            <Box component="form" noValidate>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={memberForm.full_name}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, full_name: e.target.value })
                  }
                  required
                  variant="outlined"
                  size="small"
                />

                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={2}
                >
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={memberForm.email}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, email: e.target.value })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={memberForm.phone}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, phone: e.target.value })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={2}
                >
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={memberForm.date_of_birth}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        date_of_birth: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={memberForm.gender}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, gender: e.target.value })
                      }
                      label="Gender"
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <TextField
                  fullWidth
                  label="National ID"
                  value={memberForm.national_id}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      national_id: e.target.value,
                    })
                  }
                  variant="outlined"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Physical Address"
                  multiline
                  rows={2}
                  value={memberForm.physical_address}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      physical_address: e.target.value,
                    })
                  }
                  variant="outlined"
                  size="small"
                />

                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={2}
                >
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    value={memberForm.emergency_contact_name}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        emergency_contact_name: e.target.value,
                      })
                    }
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    value={memberForm.emergency_contact_phone}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        emergency_contact_phone: e.target.value,
                      })
                    }
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={2}
                >
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Membership Type</InputLabel>
                    <Select
                      value={memberForm.membership_type}
                      onChange={(e) =>
                        setMemberForm({
                          ...memberForm,
                          membership_type: e.target.value,
                        })
                      }
                      label="Membership Type"
                    >
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Lifetime">Lifetime</MenuItem>
                      <MenuItem value="Student">Student</MenuItem>
                      <MenuItem value="Corporate">Corporate</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={memberForm.status}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, status: e.target.value })
                      }
                      label="Status"
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Preferred Communication</InputLabel>
                  <Select
                    value={memberForm.preferred_communication}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        preferred_communication: e.target.value,
                      })
                    }
                    label="Preferred Communication"
                  >
                    <MenuItem value="Email">Email</MenuItem>
                    <MenuItem value="Phone">Phone</MenuItem>
                    <MenuItem value="SMS">SMS</MenuItem>
                    <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                    <MenuItem value="Postal Mail">Postal Mail</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="How Heard About"
                  value={memberForm.how_heard_about}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      how_heard_about: e.target.value,
                    })
                  }
                  variant="outlined"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Reason for Joining"
                  multiline
                  rows={3}
                  value={memberForm.reason_for_joining}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      reason_for_joining: e.target.value,
                    })
                  }
                  variant="outlined"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Areas of Interest"
                  multiline
                  rows={3}
                  value={memberForm.areas_of_interest}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      areas_of_interest: e.target.value,
                    })
                  }
                  variant="outlined"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Skills Contribution"
                  multiline
                  rows={3}
                  value={memberForm.skills_contribution}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      skills_contribution: e.target.value,
                    })
                  }
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => {
                setOpenEditDialog(false);
                setSelectedMember(null);
                setMemberForm({
                  full_name: "",
                  email: "",
                  phone: "",
                  date_of_birth: "",
                  gender: "",
                  national_id: "",
                  physical_address: "",
                  emergency_contact_name: "",
                  emergency_contact_phone: "",
                  membership_type: "Regular",
                  how_heard_about: "",
                  reason_for_joining: "",
                  areas_of_interest: "",
                  skills_contribution: "",
                  preferred_communication: "",
                  status: "Pending",
                });
              }}
              variant="outlined"
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                "&:hover": {
                  borderColor: "#5a6fd8",
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMember}
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: "#667eea",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                "&:hover": {
                  backgroundColor: "#5a6fd8",
                },
              }}
            >
              {loading ? <CircularProgress size={20} /> : "Update Member"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default PublicMembers;

