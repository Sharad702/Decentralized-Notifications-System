// alert.service.ts
import { v4 as uuidv4 } from 'uuid';

export interface Alert {
  id: string;
  name: string;
  condition: string;
  isActive: boolean;
  lastTriggered?: Date;
}

const alerts: Alert[] = [];

export const getAlerts = () => alerts;

export const getAlertById = (id: string) => alerts.find(a => a.id === id);

export const createAlert = (data: Omit<Alert, 'id' | 'lastTriggered'>) => {
  const alert: Alert = { ...data, id: uuidv4() };
  alerts.push(alert);
  return alert;
};

export const updateAlert = (id: string, data: Partial<Omit<Alert, 'id'>>) => {
  const alert = getAlertById(id);
  if (!alert) return null;
  Object.assign(alert, data);
  return alert;
};

export const deleteAlert = (id: string) => {
  const idx = alerts.findIndex(a => a.id === id);
  if (idx === -1) return false;
  alerts.splice(idx, 1);
  return true;
}; 