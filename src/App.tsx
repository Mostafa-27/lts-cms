import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/routes/LoginPage";
import SettingsPage from "./components/routes/SettingsPage";
import AppLayout from "./components/layout/AppLayout";
import GalleryPage from "./components/routes/GalleryPage";
import HomePage from "./components/routes/HomePage";
import ServicesPage from "./components/routes/ServicesPage";
import CareerPage from "./components/routes/CareerPage";
import AboutPage from "./components/routes/AboutPage";
import ContactPage from "./components/routes/ContactPage";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/ui/theme-provider";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes with layout */}
            {/* <Route element={<ProtectedRoute />}> */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/pages">
                  <Route path="home" element={<HomePage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="career" element={<CareerPage />} />
                  <Route path="about-us" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                </Route>
              </Route>
            </Route>
            {/* </Route> */}

            {/* Redirect to login by default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
