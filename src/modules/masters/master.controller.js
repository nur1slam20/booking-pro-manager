import {
  listMasters,
  getMaster,
  getMasterWithDetails,
  createMasterService,
  updateMasterService,
  deleteMasterService,
  addMasterToServiceService,
  removeMasterFromServiceService,
  updateMasterScheduleService,
  checkMasterAvailabilityService,
  getAvailableTimeSlotsService,
} from './master.service.js';

export async function getMastersController(req, res, next) {
  try {
    const result = await listMasters(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMasterController(req, res, next) {
  try {
    const master = await getMaster(Number(req.params.id));
    res.json(master);
  } catch (err) {
    next(err);
  }
}

export async function getMasterDetailsController(req, res, next) {
  try {
    const master = await getMasterWithDetails(Number(req.params.id));
    res.json(master);
  } catch (err) {
    next(err);
  }
}

export async function createMasterController(req, res, next) {
  try {
    const master = await createMasterService(req.body);
    res.status(201).json(master);
  } catch (err) {
    next(err);
  }
}

export async function updateMasterController(req, res, next) {
  try {
    const master = await updateMasterService(Number(req.params.id), req.body);
    res.json(master);
  } catch (err) {
    next(err);
  }
}

export async function deleteMasterController(req, res, next) {
  try {
    await deleteMasterService(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function addMasterToServiceController(req, res, next) {
  try {
    const { serviceId } = req.body;
    await addMasterToServiceService(Number(req.params.id), serviceId);
    res.status(201).json({ message: 'Мастер добавлен к услуге' });
  } catch (err) {
    next(err);
  }
}

export async function removeMasterFromServiceController(req, res, next) {
  try {
    await removeMasterFromServiceService(Number(req.params.id), Number(req.params.serviceId));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function updateMasterScheduleController(req, res, next) {
  try {
    const schedule = await updateMasterScheduleService(Number(req.params.id), req.body);
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

export async function checkMasterAvailabilityController(req, res, next) {
  try {
    const { date, time } = req.query;
    const availability = await checkMasterAvailabilityService(
      Number(req.params.id),
      date,
      time,
    );
    res.json(availability);
  } catch (err) {
    next(err);
  }
}

export async function getAvailableTimeSlotsController(req, res, next) {
  try {
    const { date, duration } = req.query;
    const slots = await getAvailableTimeSlotsService(
      Number(req.params.id),
      date,
      duration ? Number(duration) : 60,
    );
    res.json({ slots });
  } catch (err) {
    next(err);
  }
}

