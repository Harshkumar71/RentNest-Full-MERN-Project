import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const dateValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [booking, setBooking] = useState({ checkIn: '', checkOut: '', guests: 1, paymentMethod: 'COD', customerNote: '' });
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [busy, setBusy] = useState(false);
  const today = dateValue(new Date());
  const nights = useMemo(() => booking.checkIn && booking.checkOut && new Date(booking.checkOut) > new Date(booking.checkIn) ? Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000) : 0, [booking.checkIn, booking.checkOut]);
  const load = async () => {
    const [p, r] = await Promise.all([api.get(`/properties/${id}`), api.get(`/reviews/${id}`)]);
    setProperty(p.data); setReviews(r.data);
  };
  useEffect(() => { load().catch(() => setProperty(false)); }, [id]);
  if (property === false) return <main className="container"><h2>Property not found</h2><Link to="/properties">Back to properties</Link></main>;
  if (!property) return <Loader />;
  const book = async (event) => {
    event.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'customer') return alert('Please sign in with a customer account to request a booking.');
    setBusy(true);
    try {
      await api.post('/bookings', { propertyId: id, ...booking });
      alert('Booking request sent! You can track it from My bookings.');
      navigate('/dashboard');
    } catch (error) { alert(error.response?.data?.message || 'Booking request failed'); }
    finally { setBusy(false); }
  };
  const submitReview = async () => {
    try { await api.post(`/reviews/${id}`, review); setReview({ rating: 5, comment: '' }); await load(); }
    catch (error) { alert(error.response?.data?.message || 'Review failed'); }
  };
  return <main className="container">
    <div className="details">
      <section>
        <img className="main-image" src={property.images?.[0] || 'https://placehold.co/900x600?text=RentNest+Property'} alt={property.title} />
        <div className="property-heading"><div><h1>{property.title}</h1><p className="muted">{property.location?.address}, {property.location?.city}, {property.location?.state}</p></div><span className="tag">{property.type}</span></div>
        <p className="details-description">{property.description}</p>
        <div className="detail-facts"><span>🛏 {property.bedrooms} bedrooms</span><span>🛁 {property.bathrooms} bathrooms</span><span>👥 Up to {property.maxGuests} guests</span></div>
        <h3>What this place offers</h3><div className="amenities">{property.amenities?.length ? property.amenities.map(item => <span key={item}>{item}</span>) : <span>Comfortable stay</span>}</div>
        <h2>Guest reviews</h2>
        {reviews.map(item => <div className="review" key={item._id}><b>{item.customer?.name || 'Guest'}</b> · ⭐ {item.rating}<p>{item.comment}</p></div>)}
        {user?.role === 'customer' && <div className="card"><h3>Write a review</h3><select value={review.rating} onChange={e => setReview({ ...review, rating: Number(e.target.value) })}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}</select><textarea placeholder="Share your experience" value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} /><button className="btn" onClick={submitReview}>Submit review</button></div>}
      </section>
      <aside className="booking-box">
        <div className="price-line"><strong>₹{Number(property.pricePerNight).toLocaleString('en-IN')}</strong><span>/ night</span></div>
        <form onSubmit={book}>
          <label>Check-in</label><input type="date" required min={today} value={booking.checkIn} onChange={e => setBooking({ ...booking, checkIn: e.target.value, checkOut: booking.checkOut && booking.checkOut <= e.target.value ? '' : booking.checkOut })} />
          <label>Check-out</label><input type="date" required min={booking.checkIn || today} value={booking.checkOut} onChange={e => setBooking({ ...booking, checkOut: e.target.value })} />
          <label>Guests</label><input type="number" required min="1" max={property.maxGuests} value={booking.guests} onChange={e => setBooking({ ...booking, guests: Number(e.target.value) })} />
          <label>Payment method</label>
          <div className="payment-choice"><label className={`payment-option ${booking.paymentMethod === 'COD' ? 'selected' : ''}`}><input type="radio" name="paymentMethod" value="COD" checked={booking.paymentMethod === 'COD'} onChange={e => setBooking({ ...booking, paymentMethod: e.target.value })} /><span><b>Cash on Delivery</b><small>Pay the owner at check-in</small></span></label><label className="payment-option payment-disabled"><input type="radio" name="paymentMethod" value="ONLINE" disabled /><span><b>Online payment</b><small>Coming soon</small></span></label></div>
          <label>Note to owner (optional)</label><textarea className="note-input" maxLength="500" placeholder="Any arrival details or requests?" value={booking.customerNote} onChange={e => setBooking({ ...booking, customerNote: e.target.value })} />
          {nights > 0 && <div className="price-breakdown"><div><span>₹{Number(property.pricePerNight).toLocaleString('en-IN')} × {nights} nights</span><b>₹{(nights * property.pricePerNight).toLocaleString('en-IN')}</b></div><div className="total-line"><b>Estimated total</b><strong>₹{(nights * property.pricePerNight).toLocaleString('en-IN')}</strong></div></div>}
          <button className="btn full" disabled={busy}>{busy ? 'Sending request…' : 'Request booking'}</button>
          <p className="muted tiny">Your booking stays pending until the property owner confirms it.</p>
        </form>
      </aside>
    </div>
  </main>;
}
