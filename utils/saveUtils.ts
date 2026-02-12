
export const encodeSaveData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonString));
  } catch (e) {
    console.error("Failed to encode save data", e);
    return "";
  }
};

export const decodeSaveData = (encoded: string): any | null => {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to decode save data", e);
    return null;
  }
};
