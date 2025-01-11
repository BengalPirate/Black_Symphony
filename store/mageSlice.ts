// store/mageSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MageState {
  selectedMage: string; // "fire", "earth", etc.
}

const initialState: MageState = {
  selectedMage: 'fire',
};

const mageSlice = createSlice({
  name: 'mage',
  initialState,
  reducers: {
    selectMage: (state, action: PayloadAction<string>) => {
      state.selectedMage = action.payload;
    },
  },
});

export const { selectMage } = mageSlice.actions;
export default mageSlice.reducer;
