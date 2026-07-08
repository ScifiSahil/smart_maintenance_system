import { configureStore } from '@reduxjs/toolkit';
import maintenanceReducer from '../reducers/reducers';

const store = configureStore({
  reducer: {
    maintenance: maintenanceReducer,
  },
});

export default store;