import {
  listReviews,
  getReview,
  createReviewService,
  updateReviewService,
  deleteReviewService,
  getAverageRatingService,
  markReviewHelpfulService,
  getReviewRatingDistributionService,
} from './review.service.js';

export async function getReviewsController(req, res, next) {
  try {
    const result = await listReviews(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getReviewController(req, res, next) {
  try {
    const review = await getReview(Number(req.params.id));
    res.json(review);
  } catch (err) {
    next(err);
  }
}

export async function createReviewController(req, res, next) {
  try {
    const review = await createReviewService(req.user.id, req.body);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

export async function updateReviewController(req, res, next) {
  try {
    const review = await updateReviewService(
      Number(req.params.id),
      req.user.id,
      req.body,
      req.user.role === 'admin',
    );
    res.json(review);
  } catch (err) {
    next(err);
  }
}

export async function deleteReviewController(req, res, next) {
  try {
    await deleteReviewService(Number(req.params.id), req.user.id, req.user.role === 'admin');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getAverageRatingController(req, res, next) {
  try {
    const masterId = req.query.masterId ? Number(req.query.masterId) : null;
    const serviceId = req.query.serviceId ? Number(req.query.serviceId) : null;
    const rating = await getAverageRatingService(masterId, serviceId);
    res.json(rating);
  } catch (err) {
    next(err);
  }
}

export async function markReviewHelpfulController(req, res, next) {
  try {
    const { isHelpful } = req.body;
    const result = await markReviewHelpfulService(
      Number(req.params.id),
      req.user.id,
      isHelpful === true,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getRatingDistributionController(req, res, next) {
  try {
    const masterId = req.query.masterId ? Number(req.query.masterId) : null;
    const serviceId = req.query.serviceId ? Number(req.query.serviceId) : null;
    const distribution = await getReviewRatingDistributionService(masterId, serviceId);
    res.json(distribution);
  } catch (err) {
    next(err);
  }
}

export async function getReviewHelpfulStatusController(req, res, next) {
  try {
    const status = await getReviewHelpfulStatusService(
      Number(req.params.id),
      req.user.id,
    );
    res.json(status);
  } catch (err) {
    next(err);
  }
}

