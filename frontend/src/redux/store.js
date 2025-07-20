import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import pagesReducer from './pagesSlice';
import themeReducer from './themeSlice';
import userReducer from './userSlice'
import authReducer from "./authSlice";

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  pages: pagesReducer,
  theme: themeReducer,
  user:userReducer,
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
