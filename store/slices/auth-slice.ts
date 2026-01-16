import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/lib/types";
import type { LoginFormData, RegisterFormData } from "@/lib/schemas";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginFormData) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data: Omit<RegisterFormData, "confirmPassword">) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  return null;
});

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    const response = await fetch("/api/auth/me");
    if (!response.ok) throw new Error("Not authenticated");
    return response.json();
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    data: { name?: string; phone?: string; address?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || "Failed to update profile");
      }

      return result; // This is the updated user object
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result.error);
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Registration failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
      });
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // We merge or overwrite the user data
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      builder
  .addCase(changePassword.pending, (state) => {
    state.isLoading = true;
    state.error = null;
  })
  .addCase(changePassword.fulfilled, (state) => {
    state.isLoading = false;
    state.error = null;
    // No need to update state.user here as the password isn't stored in state
  })
  .addCase(changePassword.rejected, (state, action) => {
    state.isLoading = false;
    state.error = action.payload as string || "Failed to change password";
  });
  },
});

export const { clearError } = authSlice.actions;
