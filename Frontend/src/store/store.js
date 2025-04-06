import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./userAuthSlice";
import workshopAuthReducer from "./workshopAuthSlice"
import chatReducer from "./chatSlice";

const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    workshopAuth: workshopAuthReducer,
    chat: chatReducer,
  },
});

export default store;
