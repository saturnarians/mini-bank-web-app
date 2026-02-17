import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/lib/types";
import type { LoginFormData, RegisterFormData } from "@/lib/schemas";

type ApiErrorPayload = {
  error?: string;
  message?: string;
  redirectTo?: string;
  requiresVerification?: boolean;
  email?: string;
};

function toErrorMessage(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const p = payload as ApiErrorPayload;
    return p.message || p.error || "Request failed";
  }
  return "Request failed";
}

/**
 * Initial auth state
 * - user: hydrated from /me
 * - isAuthenticated: single source of truth
 * - isLoading: UI + request sync
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hydrated: false,
};

/**
 * LOGIN
 * - credentials included to persist HttpOnly cookies
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: LoginFormData, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return rejectWithValue(result);
      }

      // 🔑 identity hydration happens immediately Hydrate user from /me
      const user = await dispatch(getCurrentUser()).unwrap();
      // Return the user so the login form can use it
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/**
 * LOGOUT
 * - clears server session
 */
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  return null;
});

/**
 * REGISTER
 */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    data: Omit<RegisterFormData, "confirmPassword">,
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      // await dispatch(getCurrentUser()).unwrap() how can i use the dispatch

      const result = await res.json();
      if (!res.ok) return rejectWithValue(result);

      return result;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/**
 * HYDRATE AUTH (BOOT-TIME)
 * - single source of truth after refresh
 */
export const getCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET", // or POST if you prefer, but GET is standard for fetching data
        headers: { "Content-Type": "application/json" },

        credentials: "include",
      });

      if (!res.ok) throw new Error("UNAUTHENTICATED");
      return await res.json();
    } catch {
      return rejectWithValue(null);
    }
  },
);

/**
 * UPDATE PROFILE
 */
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    data: {
      name?: string;
      phone?: string;
      address?: string;
      profilePhotoUrl?: string;
      idCardUrl?: string;
      kycStatus?: "not_submitted" | "pending" | "verified" | "rejected";
      kycUpdatedAt?: string | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error);

      return result;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/**
 * CHANGE PASSWORD
 */
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    data: { currentPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error);

      return result;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/**
 * AUTH SLICE
 */
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },

    /**
     * Used only for SSR or forced hydration
     */
    setInitialAuth(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.hydrated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // `loginUser` returns the hydrated user object (from getCurrentUser)
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.hydrated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = toErrorMessage(action.payload);
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = toErrorMessage(action.payload);
      })

      // HYDRATE
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.hydrated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.hydrated = true;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      // PROFILE
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // PASSWORD
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = toErrorMessage(action.payload);
      });
  },
});

export const { clearError, setInitialAuth } = authSlice.actions;
export default authSlice.reducer;
