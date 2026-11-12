import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentId: String,
  customerNote: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
