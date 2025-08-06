import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import wishlistService, { WishlistItem } from '@/services/wishlistService';

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  totalCount: 0,
};

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'İstek listesi yüklenirken bir hata oluştu');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await wishlistService.addToWishlist(productId);
      return { productId, message: response.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ürün istek listesine eklenirken bir hata oluştu');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await wishlistService.removeFromWishlist(itemId);
      return { itemId, message: response.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ürün istek listesinden çıkarılırken bir hata oluştu');
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.clearWishlist();
      return { message: response.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'İstek listesi temizlenirken bir hata oluştu');
    }
  }
);

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.items = [];
      state.totalCount = 0;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist
    builder.addCase(fetchWishlist.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistResponse>) => {
      state.loading = false;
      state.items = action.payload.data;
      state.totalCount = action.payload.totalCount;
    });
    builder.addCase(fetchWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add to wishlist
    builder.addCase(addToWishlist.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addToWishlist.fulfilled, (state) => {
      state.loading = false;
      // Ürün eklendikten sonra listeyi yenilemek için fetchWishlist kullanılacak
    });
    builder.addCase(addToWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Remove from wishlist
    builder.addCase(removeFromWishlist.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<{ itemId: string; message: string }>) => {
      state.loading = false;
      state.items = state.items.filter((item) => item._id !== action.payload.itemId);
      state.totalCount = Math.max(0, state.totalCount - 1);
    });
    builder.addCase(removeFromWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Clear wishlist
    builder.addCase(clearWishlist.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearWishlist.fulfilled, (state) => {
      state.loading = false;
      state.items = [];
      state.totalCount = 0;
    });
    builder.addCase(clearWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetWishlist } = wishlistSlice.actions;

interface WishlistResponse {
  data: WishlistItem[];
  totalCount: number;
}

export default wishlistSlice.reducer;