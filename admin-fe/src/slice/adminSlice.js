// src/slice/adminSlice.js

import {
  createSlice
} from '@reduxjs/toolkit';

const initialState = {
  admin: {
    id: null,
    fullName: '',
    avatar: '',
    roleId: '',
    roleName: ''
  },
  permissions: [],
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminInfo: (state, action) => {
      state.admin.id = action.payload.id;
      state.admin.fullName = action.payload.fullName;
      state.admin.avatar = action.payload.avatar;
      state.admin.roleName = action.payload.roleName;
      state.admin.roleId = action.payload.roleId;
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    clearAdminInfo: (state) => {
      state.admin = {
        id: null,
        fullName: ''
      };
      state.permissions = [];
    },
  },
});

export const {
  setAdminInfo,
  setPermissions,
  clearAdminInfo
} = adminSlice.actions;

export default adminSlice.reducer;