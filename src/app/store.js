import { createStore, combineReducers, applyMiddleware } from 'redux';
import equipment from './reducers/equipmentReducer';
import plants from './reducers/plantsReducer';
import checklist from './reducers/checklistReducer';   // ← ye import hona chahiye

const rootReducer = combineReducers({
  equipment,
  plants,
  checklist,   // ← ye yahan register hona chahiye
});