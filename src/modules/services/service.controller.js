import {
  listServices,
  getService,
  createServiceService,
  updateServiceService,
  toggleServiceActiveService,
  deleteServiceService,
} from './service.service.js';

export async function getServicesController(req, res, next) {
  try {
    const result = await listServices(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getServiceController(req, res, next) {
  try {
    const service = await getService(Number(req.params.id));
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function createServiceController(req, res, next) {
  try {
    const service = await createServiceService(req.body);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
}

export async function updateServiceController(req, res, next) {
  try {
    const service = await updateServiceService(Number(req.params.id), req.body);
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function toggleServiceActiveController(req, res, next) {
  try {
    const service = await toggleServiceActiveService(Number(req.params.id));
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function deleteServiceController(req, res, next) {
  try {
    await deleteServiceService(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}



