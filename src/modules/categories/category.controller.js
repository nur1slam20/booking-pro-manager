import {
  listCategories,
  getCategory,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from './category.service.js';

export async function getCategoriesController(req, res, next) {
  try {
    const categories = await listCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryController(req, res, next) {
  try {
    const category = await getCategory(Number(req.params.id));
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function createCategoryController(req, res, next) {
  try {
    const category = await createCategoryService(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategoryController(req, res, next) {
  try {
    const category = await updateCategoryService(Number(req.params.id), req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategoryController(req, res, next) {
  try {
    await deleteCategoryService(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

