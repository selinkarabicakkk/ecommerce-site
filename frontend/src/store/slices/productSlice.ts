import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productService } from '@/services';
import { PaginatedResponse, Product, ProductFilters } from '@/types';

interface ProductState {
  products: Product[];
  product: Product | null;
  featuredProducts: Product[];
  newArrivals: Product[];
  topRatedProducts: Product[];
  relatedProducts: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
  filters: ProductFilters;
}

// Başlangıç durumu
const initialState: ProductState = {
  products: [],
  product: null,
  featuredProducts: [],
  newArrivals: [],
  topRatedProducts: [],
  relatedProducts: [],
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
  filters: {
    page: 1,
    limit: 12,
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (filters: ProductFilters, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ürünler alınırken bir hata oluştu'
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ürün detayları alınırken bir hata oluştu'
      );
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'product/fetchProductBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await productService.getProductBySlug(slug);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ürün detayları alınırken bir hata oluştu'
      );
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'product/fetchFeaturedProducts',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Öne çıkan ürünler alınırken bir hata oluştu'
      );
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'product/fetchNewArrivals',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const response = await productService.getNewArrivals(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Yeni ürünler alınırken bir hata oluştu'
      );
    }
  }
);

export const fetchTopRatedProducts = createAsyncThunk(
  'product/fetchTopRatedProducts',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const response = await productService.getTopRatedProducts(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'En çok puan alan ürünler alınırken bir hata oluştu'
      );
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'product/fetchRelatedProducts',
  async ({ productId, limit = 4 }: { productId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await productService.getRelatedProducts(productId, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'İlgili ürünler alınırken bir hata oluştu'
      );
    }
  }
);

// Product slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearProduct: (state) => {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.data || [];
      state.page = action.payload.page || 1;
      state.pages = action.payload.pages || 1;
      state.total = action.payload.total || 0;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch product by ID
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.product = action.payload || null;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch product by slug
    builder.addCase(fetchProductBySlug.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductBySlug.fulfilled, (state, action) => {
      state.loading = false;
      state.product = action.payload || null;
    });
    builder.addCase(fetchProductBySlug.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch featured products
    builder.addCase(fetchFeaturedProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.featuredProducts = action.payload || [];
    });
    builder.addCase(fetchFeaturedProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch new arrivals
    builder.addCase(fetchNewArrivals.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNewArrivals.fulfilled, (state, action) => {
      state.loading = false;
      state.newArrivals = action.payload || [];
    });
    builder.addCase(fetchNewArrivals.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch top rated products
    builder.addCase(fetchTopRatedProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTopRatedProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.topRatedProducts = action.payload || [];
    });
    builder.addCase(fetchTopRatedProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch related products
    builder.addCase(fetchRelatedProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRelatedProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.relatedProducts = action.payload || [];
    });
    builder.addCase(fetchRelatedProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, setFilters, clearProduct } = productSlice.actions;
export default productSlice.reducer; 