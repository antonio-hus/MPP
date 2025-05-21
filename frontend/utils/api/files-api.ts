/////////////////////
// IMPORTS SECTION //
/////////////////////
import { updateServerStatus, updateNetworkStatus, isOnline } from "./health-reporting-api"
import {authFetch} from "@/utils/api/config-api";


///////////////////////
// CONSTANTS SECTION //
///////////////////////
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";


///////////////////////
// API CALLS SECTION //
///////////////////////
// File upload function
export async function uploadFile(filename: string, fileData: File): Promise<string> {
  if (!isOnline()) {
    updateNetworkStatus();
    throw new Error("Cannot upload files while offline");
  }

  try {
    const formData = new FormData();
    formData.append('file', fileData);

    const response = await authFetch(`${API_URL}/upload/${filename}/`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      updateServerStatus(true);
      throw new Error(`Error uploading file: ${response.statusText}`);
    }

    updateServerStatus(false);
    const data = await response.json();
    return data.url || data.path || filename;
  } catch (error) {
    console.log("File upload failed:", error);
    updateServerStatus(true);
    throw error;
  }
}

// File download function
export async function downloadFile(filename: string): Promise<Blob> {
  if (!isOnline()) {
    updateNetworkStatus();
    throw new Error("Cannot download files while offline");
  }

  try {
    const response = await authFetch(`${API_URL}/download/${filename}/`);

    if (!response.ok) {
      updateServerStatus(true);
      throw new Error(`Error downloading file: ${response.statusText}`);
    }

    updateServerStatus(false);
    return await response.blob();
  } catch (error) {
    console.log("File download failed:", error);
    updateServerStatus(true);
    throw error;
  }
}

export async function fetchFileList() {
  if (!isOnline()) {
    updateNetworkStatus();
    throw new Error("Cannot see files while offline");
  }

  try {
    const response = await authFetch(`${API_URL}/files/`);

    if (!response.ok) {
      updateServerStatus(true);
      throw new Error(`Error fetching files: ${response.statusText}`);
    }

    updateServerStatus(false);
    return response;
  } catch (error) {
    console.log("File list fetch failed:", error);
    updateServerStatus(true);
    throw error;
  }
}