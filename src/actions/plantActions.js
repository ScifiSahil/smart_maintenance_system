/**
 * ─── PLANT MASTER ACTIONS ────────────────────────────────────────────
 * smartpm_plant_master ke CRUD actions. Reducer: reducers/plantsReducer.js
 * Plant filter dropdown (Equipment Register) aur Configuration > Plant
 * Master CRUD page — dono isi se chalte hain.
 * ─────────────────────────────────────────────────────────────────────
 */

import { fetchPlants, createPlant, updatePlant, deletePlant } from '../services/plantApi';

// Plant master list load karta hai — response.objects array nikalta hai
export const loadPlants = () => {
  return async (dispatch) => {
    dispatch({ type: 'PLANTS_LOAD_PENDING' });
    try {
      const res = await fetchPlants();
      const items = (res.objects || [])
        .map((o) => ({
          cdb_object_id: o.cdb_object_id,
          plant_code: o.plant_code,
          plant_name: o.plant_name,
        }))
        .sort((a, b) => String(a.plant_name).localeCompare(String(b.plant_name)));
      dispatch({ type: 'PLANTS_LOAD_FULFILLED', payload: items });
    } catch (err) {
      dispatch({ type: 'PLANTS_LOAD_REJECTED', payload: err.message || 'Plant list load nahi hui' });
    }
  };
};

// Naya plant banata hai — success par list refresh karta hai
export const addPlant = (data) => {
  return async (dispatch) => {
    try {
      await createPlant(data);
      dispatch(loadPlants());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
};

// Plant update karta hai (cdb_object_id se)
export const editPlant = (cdbObjectId, data) => {
  return async (dispatch) => {
    try {
      await updatePlant(cdbObjectId, data);
      dispatch(loadPlants());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
};

// Plant delete karta hai (cdb_object_id se)
export const removePlant = (cdbObjectId) => {
  return async (dispatch) => {
    try {
      await deletePlant(cdbObjectId);
      dispatch(loadPlants());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
};
