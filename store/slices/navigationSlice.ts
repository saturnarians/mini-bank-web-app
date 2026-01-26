import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type PageType = "home" | "about" | "contact" | "login"

interface NavigationState {
  currentPage: PageType
  sidebarOpen: boolean
}

const initialState: NavigationState = {
  currentPage: "home",
  sidebarOpen: false,
}

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<PageType>) => {
      state.currentPage = action.payload
    },
  },
});

export const { setCurrentPage } = navigationSlice.actions
export default navigationSlice.reducer


