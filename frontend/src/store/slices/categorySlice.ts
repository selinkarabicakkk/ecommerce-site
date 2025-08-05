import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '@/services';
import { Category } from '@/types';

interface CategoryState {
  categories: Category[];
  category: Category | null;
  loading: boolean;
  error: string | null;
}

// Başlangıç durumu
const initialState: CategoryState = {
  categories: [],
  category: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Kategoriler alınırken bir hata oluştu'
      );
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'category/fetchCategoryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Kategori detayları alınırken bir hata oluştu'
      );
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  'category/fetchCategoryBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryBySlug(slug);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Kategori detayları alınırken bir hata oluştu'
      );
    }
  }
);

// Category slice
const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCategory: (state) => {
      state.category = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload || [];
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch category by ID
    builder.addCase(fetchCategoryById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategoryById.fulfilled, (state, action) => {
      state.loading = false;
      state.category = action.payload || null;
    });
    builder.addCase(fetchCategoryById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch category by slug
    builder.addCase(fetchCategoryBySlug.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
      state.loading = false;
      state.category = action.payload || null;
    });
    builder.addCase(fetchCategoryBySlug.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearCategory } = categorySlice.actions;
export default categorySlice.reducer; 