// src/services/hotelService.js
// This file is kept for backward compatibility
// New code should use masterService.js instead

import {
  getHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  toggleHotelActive,
  getBranchesByHotel,
  createBranch,
  updateBranch,
  deleteBranch,
  toggleBranchActive,
} from "./masterService.js";

// ----------------------
// Hotel APIs (re-exported from masterService)
// ----------------------

export async function fetchHotels() {
  const response = await getHotels();
  return response;
}

export async function saveHotel(hotel) {
  // hotel has PascalCase properties: HotelId, Code, Name, etc.
  if (hotel.HotelId && hotel.HotelId > 0) {
    return await updateHotel(hotel.HotelId, hotel);
  }
  return await createHotel(hotel);
}

export { toggleHotelActive, deleteHotel };

// ----------------------
// Branch APIs (re-exported from masterService)
// ----------------------

export async function fetchBranchesByHotel(hotelId) {
  return await getBranchesByHotel(hotelId);
}

export async function saveBranch(branch) {
  // branch has BranchId, HotelId, Code, Name, etc.
  if (branch.BranchId && branch.BranchId > 0) {
    return await updateBranch(branch.BranchId, branch);
  }
  return await createBranch(branch);
}

export { toggleBranchActive, deleteBranch };
