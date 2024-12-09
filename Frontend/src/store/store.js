import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./userAuthSlice";
import workshopAuthReducer from "./workshopAuthSlice"

const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    workshopAuth: workshopAuthReducer,
  },
});

export default store;
