import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light",
  isMobile: false,
  sidebarCollapsed: false,
  selectedCategory: "",
  isAuthenticated: false,
  sideBarOpen: false,
  IsShowCreateInstallment: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSidebarOpen: (state, action) => {
      state.sideBarOpen = action.payload;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setIsShowCreateInstallment: (state, action) => {
      state.IsShowCreateInstallment = action.payload;
    },
  },
});

export const { setSidebarOpen, setSidebarCollapsed, setIsMobile, setSelectedCategory, setIsAuthenticated, setIsShowCreateInstallment } = appSlice.actions;
export default appSlice.reducer;
