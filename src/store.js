/**
 * ─── STORE ───────────────────────────────────────────────────────────
 * Ye store CMDBuild (cs-web-components-base) ke apne Registry-based
 * reducer system se ALAG hai — bilkul independent. AdminPage.jsx ke
 * andar <Provider store={store}> se wrap hoga, sirf usi component
 * tree ke liye. Baaki app (HelloWorld, MainComponent, framework) is
 * store ko touch nahi karta.
 * ─────────────────────────────────────────────────────────────────────
 */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import equipment from './reducers/equipmentReducer';
import plants from './reducers/plantsReducer';   // 👈 naya import
import lines from './reducers/linesReducer';       // 👈 Line Name filter ke liye
import machines from './reducers/machinesReducer'; // 👈 Machine Name filter ke liye


const rootReducer = combineReducers({
  equipment,
  plants,
  lines,
  machines,
});

// Chhota thunk middleware, khud likha hai — redux-thunk package install
// karne ki zarurat nahi. Ye equipmentActions.js ke andar wale
// "return async function(dispatch) {...}" pattern ko handle karta hai.
const thunkMiddleware = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

export default store;