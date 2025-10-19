import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box, CircularProgress, Card } from "@mui/material";
import Navbar from "./Navbar";
import Settings from "../Pages/Settings";
import NotFound from "../Pages/NotFound";
import Projects from "./Projects/Projects";
import ProjectView from "./Projects/ProjectView";
import ProjectEdit from "./Projects/ProjectEdit";
import ProjectCreate from "./Projects/ProjectCreate";
import Issues from "./Issues/Issues";
import Testimony from "./Testimony/Testimony";
import CharityMap from "../CharityMap";
import Documents from "./Documents/Documents";
import UsersTable from "./Users/UsersTable";
import Analytics from "./Analytics/Analytics";
import Audit from "./Audit/Audit";
import { lazy, Suspense } from "react";

// Lazy load the Reports component to avoid loading date picker dependencies on every page
const Reports = lazy(() => import("./Reports/Reports"));

function PageRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on component mount
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      // Redirect to login if no user or token
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} setUser={setUser} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 9 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Routes>
            <Route path="home" element={<Navigate to="/analytics" replace />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/create" element={<ProjectCreate />} />
            <Route path="projects/:id" element={<ProjectView />} />
            <Route path="projects/:id/edit" element={<ProjectEdit />} />
            <Route path="issues" element={<Issues />} />
            <Route path="testimonies" element={<Testimony />} />
            <Route path="map" element={<CharityMap />} />
            <Route path="documents" element={<Documents />} />
            <Route path="audit" element={<Audit />} />
            <Route path="analytics" element={<Analytics />} />
            <Route 
              path="reports" 
              element={
                <Suspense fallback={
                  <Box
                    sx={{
                      flexGrow: 1,
                      p: { xs: 1, sm: 1.5 },
                      minHeight: "100vh",
                      background: "#f5f7fa",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Card
                      sx={{
                        background: "white",
                        borderRadius: 4,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "400px",
                          width: "600px",
                        }}
                      >
                        <CircularProgress size={60} sx={{ color: "#667eea" }} />
                      </Box>
                    </Card>
                  </Box>
                }>
                  <Reports />
                </Suspense>
              } 
            />
            <Route path="users" element={<UsersTable />} />
            <Route path="settings" element={<Settings user={user} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
