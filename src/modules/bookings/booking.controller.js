import {
  createBookingService,
  getMyBookingsService,
  getAllBookingsService,
  updateBookingStatusService,
  deleteBookingService,
  getBookingDetailsService,
  getUserBookingStatsService,
  getAdminStatsService,
} from './booking.service.js';

export async function createBookingController(req, res, next) {
  try {
    const booking = await createBookingService(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

export async function getMyBookingsController(req, res, next) {
  try {
    const bookings = await getMyBookingsService(req.user.id);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function getMyBookingStatsController(req, res, next) {
  try {
    const stats = await getUserBookingStatsService(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getAllBookingsController(req, res, next) {
  try {
    const bookings = await getAllBookingsService(req.query);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function getBookingDetailsController(req, res, next) {
  try {
    const booking = await getBookingDetailsService(Number(req.params.id), req.user);
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatusController(req, res, next) {
  try {
    const booking = await updateBookingStatusService(
      Number(req.params.id),
      req.body.status,
      req.body.adminComment || null,
      req.user.id,
    );
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

export async function deleteBookingController(req, res, next) {
  try {
    await deleteBookingService(Number(req.params.id), req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getAdminStatsController(req, res, next) {
  try {
    const stats = await getAdminStatsService();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}



