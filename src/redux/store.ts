// store.ts
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";

import storage from "redux-persist/lib/storage"; // for localStorage
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

// Step 1: Create persist config
const persistConfig = {
  key: "root",
  storage,
};

// Step 2: Combine reducers
const rootReducer = combineReducers({
  app: appReducer,
});

// Step 3: Wrap with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Step 4: Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
});

// Step 5: Create persistor
export const persistor = persistStore(store);

// Types (optional but recommended)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
