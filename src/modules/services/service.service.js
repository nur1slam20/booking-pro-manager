import Joi from 'joi';
import { badRequest, notFound } from '../../utils/error.js';
import {
  getServices,
  countServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from './service.repository.js';

const serviceSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().integer().min(0).required(),
  duration: Joi.number().integer().min(1).required(),
});

export async function listServices(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const [items, total] = await Promise.all([
    getServices({ page, limit }),
    countServices(),
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

export async function getService(id) {
  const service = await getServiceById(id);
  if (!service) {
    throw notFound('Услуга не найдена');
  }
  return service;
}

export async function createServiceService(data) {
  const { error, value } = serviceSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }
  return createService(value);
}

export async function updateServiceService(id, data) {
  const { error, value } = serviceSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  const updated = await updateService(id, value);
  if (!updated) {
    throw notFound('Услуга не найдена');
  }
  return updated;
}

export async function deleteServiceService(id) {
  const service = await getServiceById(id);
  if (!service) {
    throw notFound('Услуга не найдена');
  }
  await deleteService(id);
}


