import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UIState {
  isMobile: boolean
  theme: "light" | "dark"
  isModalOpen: boolean
  selectedTestimonial: string | null
}

const initialState: UIState = {
  isMobile: false,
  theme: "light",
  isModalOpen: false,
  selectedTestimonial: null,
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload
    },
    setIsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload
    },
    setSelectedTestimonial: (state, action: PayloadAction<string | null>) => {
      state.selectedTestimonial = action.payload
    },
  },
});

export const { setIsMobile, setTheme, setIsModalOpen, setSelectedTestimonial } = uiSlice.actions
export default uiSlice.reducer
