import "./index.css";
import InvestmentDashboard from "./components/investment-dashboard";
import { ThemeProvider } from "./components/theme/theme-provider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Profile from "./components/Profile";
import Installments from "./components/Installments";
import Settings from "./components/Settings";
import Sell from "./components/Sell";
import { AuthForms } from "./components/auth/auth-forms";

import ProtectedRoute from "./components/ProtectedRoute";
import { useSelector } from "react-redux";
import {Users} from "./components/users";

// Mock auth logic for now

export default function App() {
  const isAuthenticated = useSelector((state: any) => state.app.isAuthenticated);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthForms />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <InvestmentDashboard />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/investors"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <InvestorsPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/users"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Users/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/installments"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Installments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sells"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Sell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

