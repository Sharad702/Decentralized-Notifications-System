// alert.controller.ts
import { Request, Response } from 'express';
import * as alertService from '../services/alert.service';

export const getAllAlerts = (req: Request, res: Response) => {
  res.json(alertService.getAlerts());
};

export const getAlert = (req: Request, res: Response) => {
  const alert = alertService.getAlertById(req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  res.json(alert);
};

export const createAlert = (req: Request, res: Response) => {
  const { name, condition, isActive } = req.body;
  if (!name || !condition || typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'Invalid data' });
  }
  const alert = alertService.createAlert({ name, condition, isActive });
  res.status(201).json(alert);
};

export const updateAlert = (req: Request, res: Response) => {
  const alert = alertService.updateAlert(req.params.id, req.body);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  res.json(alert);
};

export const deleteAlert = (req: Request, res: Response) => {
  const success = alertService.deleteAlert(req.params.id);
  if (!success) return res.status(404).json({ message: 'Alert not found' });
  res.status(204).send();
}; 