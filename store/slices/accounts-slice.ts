// redux/features/accounts/accountSlice.ts

// #region Imports
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AccountsState, Account } from "@/lib/types";
import type { AccountFormData } from "@/lib/schemas";
import { createTransaction } from "./transactions-slice";
// #endregion

// #region Initial State
// Central state for account dashboard UX
const initialState: AccountsState = {
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,
};
// #endregion

// #region Helpers
// Normalize fetch errors so UI never explodes 🚑
const getErrorMessage = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message ?? "Request failed";
  } catch {
    return "Request failed";
  }
};
// #endregion

// #region Thunks (Async actions calling API)

// Fetch ALL user accounts
export const fetchAccounts = createAsyncThunk<Account[]>(
  "accounts/fetchAccounts",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/accounts");
    if (!res.ok) return rejectWithValue(await getErrorMessage(res));
    return res.json();
  }
);

// Create NEW account
export const createAccount = createAsyncThunk<Account, AccountFormData>(
  "accounts/createAccount",
  async (data, { rejectWithValue }) => {
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return rejectWithValue(await getErrorMessage(res));
    return res.json();
  }
);

// Update account (user OR admin)
export const updateAccount = createAsyncThunk<
  Account,
  { id: string; data: Partial<Account> }
>("accounts/updateAccount", async ({ id, data }, { rejectWithValue }) => {
  const res = await fetch(`/api/accounts/${id}`, {
    method: "PATCH", // PATCH = partial update
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return rejectWithValue(await getErrorMessage(res));
  return res.json();
});

// Delete (or close) account
export const deleteAccount = createAsyncThunk<string, string>(
  "accounts/deleteAccount",
  async (id, { rejectWithValue }) => {
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (!res.ok) return rejectWithValue(await getErrorMessage(res));
    return id;
  }
);
// #endregion

// in admin-slice.ts or accounts-slice.ts
export const adminUpdateBalance = createAsyncThunk(
  "admin/updateBalance",
  async ({ accountId, amount }: { accountId: string; amount: number }) => {
    const response = await fetch(`/api/admin/accounts/${accountId}/balance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error("Admin update failed");
    return response.json(); // Returns the updated Account object
  }
);

export const updateAccountStatus = createAsyncThunk(
  "accounts/updateStatus",
  async ({ id, status }: { id: string; status: string }) => {
    const res = await fetch(`/api/admin/accounts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  }
);

// #region Slice
export const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    // Select account for details modal, editing, etc
    selectAccount: (state, action: PayloadAction<Account | null>) => {
      state.selectedAccount = action.payload;
    },
    // Reset errors safely
    clearError: (state) => {
      state.error = null;
    },
  },

  // Reducer reactions to async thunk lifecycle
  extraReducers: (builder) => {
    builder
      // Fetch lifecycle
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to fetch accounts";
      })

      // Create lifecycle
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to create account";
      })

      // Update lifecycle
      .addCase(updateAccount.fulfilled, (state, action) => {
        const i = state.accounts.findIndex(
          (acc) => acc.id === action.payload.id
        );
        if (i !== -1) state.accounts[i] = action.payload;

        if (state.selectedAccount?.id === action.payload.id) {
          state.selectedAccount = action.payload;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to update account";
      })

      // Delete lifecycle
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(
          (acc) => acc.id !== action.payload
        );
        if (state.selectedAccount?.id === action.payload)
          state.selectedAccount = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to delete account";
      })

      // Listen to the transaction slice's success!
      .addCase(createTransaction.fulfilled, (state, action) => {
        const { accountId, amount, type } = action.payload;
        const account = state.accounts.find((acc) => acc.id === accountId);

        if (account) {
          // Update the balance locally so the UI feels "instant"
          if (type === "deposit") {
            account.balance += amount;
          } else {
            account.balance -= amount;
          }
          account.lastTransactionAt = new Date().toISOString();
        }
      })
      // For the admin
      .addCase(adminUpdateBalance.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(
          (acc) => acc.id === action.payload.id
        );
        if (index !== -1) {
          state.accounts[index] = action.payload; // Replace with updated account from server
        }
      })
      // Status Update ** Suspend Account ** 
      .addCase(updateAccountStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        // This updates the local state so the "Suspended" badge appears
        const account = state.accounts.find((a) => a.id === updated.id);
        if (account) {
          account.status = updated.status;
        }
      });
  },
});
// #endregion

// #region Exports
export const { selectAccount, clearError } = accountsSlice.actions;
export default accountsSlice.reducer;
// #endregion
