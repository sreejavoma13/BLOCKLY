import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ API Base URL
const API_URL = 'http://localhost:5000/api/pages/pages';

// Async thunks
const initialState = {
  pages: [],     
  favorites: [],
  singlePage: null,
  activePageId: null,
  status: 'idle', 
  error: null,
};
// Fetch all pages for user
export const fetchPages = createAsyncThunk(
  'pages/fetchPages',
  async ({ userId }, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`, {
        withCredentials: true, //  Send cookies
      });
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
//fetch favorite pages
export const fetchFavoritePages = createAsyncThunk(
  'pages/fetchFavoritePages',
  async ({ userId }, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/fav/${userId}`, {
        withCredentials: true, // Send cookies
      });
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleFavorite = (page) => (dispatch) => {
  const updatedFavorite = !page.isFavorite; // Toggle current state
  dispatch(
    updatePage({
      pageId: page.id,
      updates: { isFavorite: updatedFavorite },
    })
  );
};

// Add new page
export const addPage = createAsyncThunk(
  'pages/addPage',
  async ({ parentId, title }, thunkAPI) => {
    try {
      console.log("add page triggered")
      const response = await axios.post(
        API_URL,
        { parentId, title },
        {
          withCredentials: true, // 👈 Send cookies
        }
      );
      return response.data; 
    } catch (error) {
      console.log(error.response?.data);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update page (toggle favorite, rename etc.)
export const updatePage = createAsyncThunk(
  'pages/updatePage',
  async ({ userId,pageId, updates }, thunkAPI) => {
    try {
      await axios.put(`${API_URL}/${userId}/${pageId}`, updates, {
        withCredentials: true, // 👈 Send cookies
      });
      return { pageId, updates };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Soft delete page
export const softDeletePage = createAsyncThunk(
  'pages/softDeletePage',
  async ({userId,pageId}, thunkAPI) => {
    try {
      await axios.patch(`${API_URL}/trash/${userId}/${pageId}`, null, {
        withCredentials: true, // 👈 Send cookies
      });
      return pageId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Hard delete page
export const hardDeletePage = createAsyncThunk(
  'pages/hardDeletePage',
  async ({userId,pageId}, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${userId}/${pageId}`, {
        withCredentials: true, // 👈 Send cookies
      });
      return pageId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const fetchPageById = createAsyncThunk(
  'pages/fetchPageById',
  async ({userid,pageId}, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/single/${userid}/${pageId}`, {
        withCredentials: true,
      });
      return response.data; // { id, title, content, ... }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk: Add user as editor
export const addUserAsEditor = createAsyncThunk(
  'pages/addUserAsEditor',
  async ({ pageId, userId }, thunkAPI) => {
    try {
      const response = await axios.post(
        `/api/pages/${pageId}/addEditor`, 
        { userId }
      );
      return response.data; // { message: "User added as editor" }
    } catch (error) {
      console.error("Error in addUserAsEditor:", error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    clearFavorites(state) {
      state.favorites = [];
    },
    setActivePage(state, action) {
      state.activePageId = action.payload; // Set the current active page ID
    },
    updatePageTitle: (state, action) => {
      const { id, title } = action.payload;
      console.log("inside here",title);
      state.pages = state.pages.map((p) =>
        p.id === id ? { ...p, title } : p
      );
    },
    updatePageContent(state, action) {
      const { id, content } = action.payload;
      const page = state.pages.find((p) => p.id === id);
      if (page) {
        page.content = content;
      }
    },
    addOrUpdatePage(state, action) {
      const updatedPage = action.payload;
      const existingPage = state.pages.find((p) => p.id === updatedPage.id);

      if (existingPage) {
        Object.assign(existingPage, updatedPage);
      } else {
        state.pages.push(updatedPage);
      }
    },
    
    resetPages: (state) => {
        Object.assign(state, initialState);
    }
    
  },
  extraReducers: (builder) => {
    builder
      // Fetch pages
      .addCase(fetchPages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pages = action.payload;
        state.favorites = action.payload
          .filter((p) => p.isFavorite)
          .map((p) => p.id);
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Add page
      .addCase(addPage.fulfilled, (state, action) => {
        state.pages.push(action.payload);
      })

      // Update page (favorites, rename etc.)
      .addCase(updatePage.fulfilled, (state, action) => {
        const { pageId, updates } = action.payload;
        const page = state.pages.find((p) => p.id === pageId);
        if (page) {
          Object.assign(page, updates);
          // Update favorites list if favorite toggled
          if ('isFavorite' in updates) {
            if (updates.isFavorite) {
              state.favorites.push(pageId);
            } else {
              state.favorites = state.favorites.filter((id) => id !== pageId);
            }
          }
        }
      })

      // Soft delete
      .addCase(softDeletePage.fulfilled, (state, action) => {
        const pageId = action.payload;
        const page = state.pages.find((p) => p.id === pageId);
        if (page){
        page.isTrashed = true;
        state.favorites = state.favorites.filter((id) => id !== pageId);
        }
        if (state.activePageId === pageId) {
          state.activePageId = null;
        }
      })

      // Hard delete
      .addCase(hardDeletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter((p) => p.id !== action.payload);
        state.favorites = state.favorites.filter((id) => id !== action.payload);
        if (state.activePageId === action.payload) {
          state.activePageId = null;
        }
      })

      .addCase(fetchFavoritePages.pending, (state) => {
        state.status = 'loading';
      })

      .addCase(fetchFavoritePages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const favPages = action.payload;
        state.favorites = favPages.map((p) => p.id);

        // Update or merge favorites into pages list
        favPages.forEach((favPage) => {
          const exists = state.pages.find((p) => p.id === favPage.id);
          if (!exists) {
            state.pages.push(favPage);
          } else {
            Object.assign(exists, favPage);
          }
        });
      })
      .addCase(fetchFavoritePages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchPageById.fulfilled, (state, action) => {
        const page = action.payload;
        const exists = state.pages.find((p) => p.id === page.id);
        if (!exists) {
          state.pages.push(page);
        } else {
          Object.assign(exists, page);
        }
        state.activePageId = page.id;
      })
  },
});
export const { clearFavorites } = pagesSlice.actions;
export const {updatePageTitle}=pagesSlice.actions;
export const {setActivePage}=pagesSlice.actions;
export const {updatePageContent}=pagesSlice.actions;
export const {addOrUpdatePage,resetPages}=pagesSlice.actions;
export default pagesSlice.reducer;

