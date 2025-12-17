import Joi from 'joi';
import { badRequest, notFound } from '../../utils/error.js';
import {
  getAllMasters,
  countMasters,
  getMasterById,
  getMasterServices,
  getMasterSchedule,
  createMaster,
  updateMaster,
  deleteMaster,
  addMasterToService,
  removeMasterFromService,
  updateMasterSchedule,
  checkMasterAvailability,
  getAvailableTimeSlots,
} from './master.repository.js';

const masterSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  photo: Joi.string().uri().allow('', null).optional(),
  bio: Joi.string().allow('', null).optional(),
  experience: Joi.number().integer().min(0).max(50).optional(),
  isActive: Joi.boolean().optional(),
});

export async function listMasters(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const activeOnly = query.activeOnly !== 'false';
  const serviceId = query.serviceId ? Number(query.serviceId) : null;

  const [items, total] = await Promise.all([
    getAllMasters({ page, limit, activeOnly, serviceId }),
    countMasters(activeOnly, serviceId),
  ]);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
    },
  };
}

export async function getMaster(id) {
  const master = await getMasterById(id);
  if (!master) {
    throw notFound('Мастер не найден');
  }
  return master;
}

export async function getMasterWithDetails(id) {
  const master = await getMasterById(id);
  if (!master) {
    throw notFound('Мастер не найден');
  }

  const [services, schedule] = await Promise.all([
    getMasterServices(id),
    getMasterSchedule(id),
  ]);

  return {
    ...master,
    services,
    schedule,
  };
}

export async function createMasterService(data) {
  const { error, value } = masterSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  return createMaster({
    ...value,
    isActive: value.isActive !== undefined ? value.isActive : true,
  });
}

export async function updateMasterService(id, data) {
  const updateSchema = Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    photo: Joi.string().uri().allow('', null).optional(),
    bio: Joi.string().allow('', null).optional(),
    experience: Joi.number().integer().min(0).max(50).optional(),
    isActive: Joi.boolean().optional(),
  });

  const { error, value } = updateSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  const updated = await updateMaster(id, value);
  if (!updated) {
    throw notFound('Мастер не найден');
  }
  return updated;
}

export async function deleteMasterService(id) {
  const master = await getMasterById(id);
  if (!master) {
    throw notFound('Мастер не найден');
  }
  await deleteMaster(id);
}

export async function addMasterToServiceService(masterId, serviceId) {
  const master = await getMasterById(masterId);
  if (!master) {
    throw notFound('Мастер не найден');
  }

  // Проверяем, существует ли услуга
  const { getServiceById } = await import('../services/service.repository.js');
  const service = await getServiceById(serviceId);
  if (!service) {
    throw notFound('Услуга не найдена');
  }

  return addMasterToService(masterId, serviceId);
}

export async function removeMasterFromServiceService(masterId, serviceId) {
  await removeMasterFromService(masterId, serviceId);
}

export async function updateMasterScheduleService(masterId, schedules) {
  const master = await getMasterById(masterId);
  if (!master) {
    throw notFound('Мастер не найден');
  }

  const scheduleSchema = Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      startTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
      isAvailable: Joi.boolean().optional(),
    }),
  );

  const { error, value } = scheduleSchema.validate(schedules);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  return updateMasterSchedule(masterId, value);
}

export async function checkMasterAvailabilityService(masterId, date, time) {
  const master = await getMasterById(masterId);
  if (!master) {
    throw notFound('Мастер не найден');
  }

  if (!master.is_active) {
    return { available: false, reason: 'Мастер неактивен' };
  }

  return checkMasterAvailability(masterId, date, time);
}

export async function getAvailableTimeSlotsService(masterId, date, serviceDuration) {
  const master = await getMasterById(masterId);
  if (!master) {
    throw notFound('Мастер не найден');
  }

  if (!master.is_active) {
    return [];
  }

  return getAvailableTimeSlots(masterId, date, serviceDuration);
}

