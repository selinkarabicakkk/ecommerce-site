import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '@/services';
import { Cart, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  totalPrice: number;
  loading: boolean;
  error: string | null;
}

// Başlangıç durumu
const initialState: CartState = {
  items: [],
  totalPrice: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.getCart();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Sepet bilgileri alınırken bir hata oluştu'
    );
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (item: Omit<CartItem, '_id'>, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(item);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ürün sepete eklenirken bir hata oluştu'
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Sepet güncellenirken bir hata oluştu'
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await cartService.removeCartItem(itemId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ürün sepetten çıkarılırken bir hata oluştu'
      );
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.clearCart();
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Sepet temizlenirken bir hata oluştu'
    );
  }
});

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
      state.totalPrice = action.payload?.totalPrice || 0;
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add to cart
    builder.addCase(addToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
      state.totalPrice = action.payload?.totalPrice || 0;
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update cart item
    builder.addCase(updateCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
      state.totalPrice = action.payload?.totalPrice || 0;
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Remove cart item
    builder.addCase(removeCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeCartItem.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
      state.totalPrice = action.payload?.totalPrice || 0;
    });
    builder.addCase(removeCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Clear cart
    builder.addCase(clearCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearCart.fulfilled, (state) => {
      state.loading = false;
      state.items = [];
      state.totalPrice = 0;
    });
    builder.addCase(clearCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer; 