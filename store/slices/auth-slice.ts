import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/lib/types";
import type { LoginFormData, RegisterFormData } from "@/lib/schemas";
import { accountApi } from "@/store/services/accountsApi";

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

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result?.error || "Login failed");
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
    { dispatch, rejectWithValue },
  ) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Registration failed");

      // If the server returned the created user with accounts, seed the accounts cache
      try {
        const user = result.user;
        const firstAccount = user?.accounts?.[0];
        if (firstAccount) {
          dispatch(
            accountApi.util.updateQueryData("getAccounts", {}, (draft: any) => {
              // Ensure draft exists and is an array
              if (!draft) return;
              // Insert the new account at the top
              const exists = draft.find((a: any) => a.id === firstAccount.id);
              if (!exists) draft.unshift(firstAccount);
            })
          );
        }
      } catch (e) {
        // non-fatal cache update failure — ignore
        console.warn("Failed to update accounts cache after registration", e);
      }

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
    data: { name?: string; phone?: string; address?: string },
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
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // REGISTER

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Hydrate auth state from registration response if available
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
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
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setInitialAuth } = authSlice.actions;
export default authSlice.reducer;
