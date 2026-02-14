/**
 * Shared Device ID utility
 * Generates and persists a unique device identifier in localStorage.
 */

const DEVICE_ID_KEY = 'zivo_device_id';

export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = `DV_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}
