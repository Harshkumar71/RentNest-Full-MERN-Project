import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

const populateBooking = (query) => query
  .populate('property', 'title images pricePerNight location owner')
  .populate('customer', 'name email phone');

export const createBooking = async (req, res) => {
  const { propertyId, checkIn, checkOut, guests, paymentMethod = 'COD', customerNote = '' } = req.body;
  if (!propertyId || !checkIn || !checkOut) return res.status(400).json({ message: 'Property and booking dates are required' });
  const property = await Property.findOne({ _id: propertyId, isActive: true });
  if (!property) return res.status(404).json({ message: 'Property is unavailable' });
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ message: 'Choose valid check-in and check-out dates' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (start < today) return res.status(400).json({ message: 'Check-in date cannot be in the past' });
  const guestCount = Number(guests);
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > property.maxGuests) return res.status(400).json({ message: `Guests must be between 1 and ${property.maxGuests}` });
  if (!['COD', 'ONLINE'].includes(paymentMethod)) return res.status(400).json({ message: 'Invalid payment method' });
  if (paymentMethod === 'ONLINE') return res.status(400).json({ message: 'Online checkout is not enabled yet. Please choose Cash on Delivery.' });

  const overlap = await Booking.findOne({
    property: property._id,
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lt: end },
    checkOut: { $gt: start }
  });
  if (overlap) return res.status(409).json({ message: 'This property already has a request or booking for those dates' });

  const nights = Math.ceil((end - start) / 86400000);
  const booking = await Booking.create({
    property: property._id,
    customer: req.user._id,
    checkIn: start,
    checkOut: end,
    guests: guestCount,
    totalPrice: nights * property.pricePerNight,
    paymentMethod,
    customerNote
  });
  return res.status(201).json(await populateBooking(Booking.findById(booking._id)));
};

export const customerBookings = async (req, res) => res.json(await populateBooking(Booking.find({ customer: req.user._id }).sort('-createdAt')));

export const ownerBookings = async (req, res) => {
  const properties = await Property.find({ owner: req.user._id }).select('_id');
  res.json(await populateBooking(Booking.find({ property: { $in: properties.map(p => p._id) } }).sort('-createdAt')));
};

export const adminBookings = async (_req, res) => res.json(await populateBooking(Booking.find().sort('-createdAt')));

export const updateStatus = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('property');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const { status } = req.body;
  const isAdmin = req.user.role === 'admin';
  const isOwner = req.user.role === 'owner' && String(booking.property.owner) === String(req.user._id);
  const isCustomer = req.user.role === 'customer' && String(booking.customer) === String(req.user._id);
  if (!isAdmin && !isOwner && !isCustomer) return res.status(403).json({ message: 'You cannot update this booking' });

  const allowed = isCustomer ? ['cancelled'] : ['confirmed', 'rejected', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status change' });
  if (isCustomer && !['pending', 'confirmed'].includes(booking.status)) return res.status(400).json({ message: 'This booking can no longer be cancelled' });
  if ((isOwner || isAdmin) && status === 'completed' && booking.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bookings can be completed' });
  if ((isOwner || isAdmin) && ['confirmed', 'completed'].includes(status)) {
    const conflict = await Booking.findOne({ _id: { $ne: booking._id }, property: booking.property._id, status: 'confirmed', checkIn: { $lt: booking.checkOut }, checkOut: { $gt: booking.checkIn } });
    if (conflict) return res.status(409).json({ message: 'Another confirmed booking overlaps these dates' });
  }
  booking.status = status;
  await booking.save();
  return res.json(await populateBooking(Booking.findById(booking._id)));
};

export const updatePaymentStatus = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('property');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const allowed = req.user.role === 'admin' || (req.user.role === 'owner' && String(booking.property.owner) === String(req.user._id));
  if (!allowed) return res.status(403).json({ message: 'Only the property owner or admin can record collected payment' });
  if (booking.paymentMethod !== 'COD') return res.status(400).json({ message: 'This booking uses online payment' });
  if (booking.status !== 'confirmed' && booking.status !== 'completed') return res.status(400).json({ message: 'Confirm the booking before recording payment' });
  booking.paymentStatus = req.body.paymentStatus === 'paid' ? 'paid' : 'pending';
  await booking.save();
  return res.json(await populateBooking(Booking.findById(booking._id)));
};
