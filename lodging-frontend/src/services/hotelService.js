// src/services/hotelService.js
import axios from "axios";
import {baseUrl} from "../utils/url";

// You can later move this to a central axios instance if you like
const api = axios.create({
  baseURL: baseUrl,
});

// ----------------------
// Hotel APIs
// ----------------------

export async function fetchHotels() {
  const res = await api.get("/api/hotels");
  return res.data;
}

export async function saveHotel(hotel) {
  // hotel has PascalCase properties: HotelId, Code, Name, etc.
  if (hotel.HotelId && hotel.HotelId > 0) {
    const res = await api.put(`/api/hotels/${hotel.HotelId}`, hotel);
    return res.data;
  }
  const res = await api.post("/api/hotels", hotel);
  return res.data;
}

export async function toggleHotelActive(hotelId, isActive) {
  const res = await api.patch(`/api/hotels/${hotelId}/status`, { isActive });
  return res.data;
}

export async function deleteHotel(hotelId) {
  const res = await api.delete(`/api/hotels/${hotelId}`);
  return res.data;
}

// ----------------------
// Branch APIs
// ----------------------

export async function fetchBranchesByHotel(hotelId) {
  // choose whichever pattern you implement on API side
  const res = await api.get(`/api/hotels/${hotelId}/branches`);
  return res.data;
  // or: await api.get("/api/branches", { params: { hotelId } });
}

export async function saveBranch(branch) {
  // branch has BranchId, HotelId, Code, Name, etc.
  if (branch.BranchId && branch.BranchId > 0) {
    const res = await api.put(`/api/branches/${branch.BranchId}`, branch);
    return res.data;
  }
  const res = await api.post("/api/branches", branch);
  return res.data;
}

export async function toggleBranchActive(branchId, isActive) {
  const res = await api.patch(`/api/branches/${branchId}/status`, { isActive });
  return res.data;
}

export async function deleteBranch(branchId) {
  const res = await api.delete(`/api/branches/${branchId}`);
  return res.data;
}
