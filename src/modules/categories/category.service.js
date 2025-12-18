import Joi from 'joi';
import { badRequest, notFound } from '../../utils/error.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './category.repository.js';

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  icon: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
});

export async function listCategories() {
  return getAllCategories();
}

export async function getCategory(id) {
  const category = await getCategoryById(id);
  if (!category) {
    throw notFound('Категория не найдена');
  }
  return category;
}

export async function createCategoryService(data) {
  const { error, value } = categorySchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }
  return createCategory(value);
}

export async function updateCategoryService(id, data) {
  const updateSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    icon: Joi.string().allow('', null).optional(),
    description: Joi.string().allow('', null).optional(),
  });

  const { error, value } = updateSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  const updated = await updateCategory(id, value);
  if (!updated) {
    throw notFound('Категория не найдена');
  }
  return updated;
}

export async function deleteCategoryService(id) {
  const category = await getCategoryById(id);
  if (!category) {
    throw notFound('Категория не найдена');
  }
  await deleteCategory(id);
}

