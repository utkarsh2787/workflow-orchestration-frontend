import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = { id: number; name: string; email: string } | null;

export type AuthState = {
    user: User;
    loading: boolean;
    error?: string | null;
};

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
};

export const validateAuth = createAsyncThunk("auth/validate", async (_, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/user/me`, { credentials: "include" });
        if (!res.ok) {
            const txt = await res.text();
            return rejectWithValue(txt || "Not authenticated");
        }
        const data = await res.json();
        return data.user;
    } catch (err: any) {
        return rejectWithValue(err?.message || "Network error");
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
            state.error = null;
        },
        clearUser(state) {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(validateAuth.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(validateAuth.fulfilled, (state, action: PayloadAction<User>) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(validateAuth.rejected, (state, action) => {
            state.loading = false;
            state.user = null;
            state.error = (action.payload as string) || "Not authenticated";
        });
    },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
