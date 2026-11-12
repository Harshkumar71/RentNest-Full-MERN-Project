import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const date = value => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const titleCase = value => value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

function Status({ value }) { return <span className={`status status-${value}`}>{titleCase(value)}</span>; }
function BookingRow({ booking, role, refresh }) {
  const [busy, setBusy] = useState(false);
  const act = async (path, body) => {
    setBusy(true);
    try { await api.patch(path, body); await refresh(); }
    catch (error) { alert(error.response?.data?.message || 'Could not update booking'); }
    finally { setBusy(false); }
  };
  const customer = role !== 'customer';
  return <article className="booking-item">
    <div className="booking-thumb"><img src={booking.property?.images?.[0] || 'https://placehold.co/160x120?text=RentNest'} alt="" /></div>
    <div className="booking-main">
      <div className="booking-title-line"><h3>{booking.property?.title || 'Property'}</h3><Status value={booking.status} /></div>
      <p className="muted">{booking.property?.location?.city || 'Location not available'} · {booking.guests} guest{booking.guests === 1 ? '' : 's'}</p>
      <p className="booking-dates">{date(booking.checkIn)} <span>→</span> {date(booking.checkOut)}</p>
      {customer ? <p className="muted">Payment: {booking.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'} · <Status value={booking.paymentStatus} /></p> : <p className="muted">Customer: <b>{booking.customer?.name || 'Customer'}</b> · {booking.customer?.email || ''}</p>}
      {booking.customerNote && <p className="booking-note">Note: {booking.customerNote}</p>}
    </div>
    <div className="booking-side"><strong>{money(booking.totalPrice)}</strong><small>{booking.paymentMethod || 'COD'} · {titleCase(booking.paymentStatus)}</small>
      <div className="booking-actions">
        {customer && ['pending', 'confirmed'].includes(booking.status) && <button className="btn-quiet danger-text" disabled={busy} onClick={() => { if (confirm('Cancel this booking request?')) act(`/bookings/${booking._id}/status`, { status: 'cancelled' }); }}>Cancel</button>}
        {!customer && booking.status === 'pending' && <><button className="btn-quiet" disabled={busy} onClick={() => act(`/bookings/${booking._id}/status`, { status: 'rejected' })}>Reject</button><button className="btn small" disabled={busy} onClick={() => act(`/bookings/${booking._id}/status`, { status: 'confirmed' })}>Approve</button></>}
        {!customer && booking.status === 'confirmed' && <button className="btn-quiet" disabled={busy} onClick={() => act(`/bookings/${booking._id}/status`, { status: 'completed' })}>Complete</button>}
        {!customer && booking.paymentMethod === 'COD' && booking.paymentStatus !== 'paid' && ['confirmed', 'completed'].includes(booking.status) && <button className="btn-quiet" disabled={busy} onClick={() => act(`/bookings/${booking._id}/payment-status`, { paymentStatus: 'paid' })}>Mark COD paid</button>}
      </div>
    </div>
  </article>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const admin = user?.role === 'admin';
  const owner = user?.role === 'owner';
  const refresh = useCallback(async () => {
    if (!user) return;
    const endpoint = admin ? '/bookings/admin' : owner ? '/bookings/owner' : '/bookings/my';
    const [bookingResult, statsResult] = await Promise.all([
      api.get(endpoint),
      admin ? api.get('/admin/stats').catch(() => ({ data: null })) : Promise.resolve({ data: null })
    ]);
    setItems(bookingResult.data); setStats(statsResult.data);
  }, [user, admin, owner]);
  useEffect(() => { setLoading(true); refresh().catch(error => alert(error.response?.data?.message || 'Could not load dashboard')).finally(() => setLoading(false)); }, [refresh]);
  const filtered = items.filter(item => filter === 'all' || item.status === filter);
  const count = status => items.filter(item => item.status === status).length;
  if (loading) return <Loader />;
  return <main className="container dashboard-page">
    <div className="dashboard-welcome"><div><span className="eyebrow">RENTNEST WORKSPACE</span><h1>{admin ? 'Admin overview' : owner ? 'Owner dashboard' : 'My bookings'}</h1><p className="muted">{admin ? 'Manage bookings and monitor the rental marketplace.' : owner ? 'Review guest requests and manage your reservations.' : `Welcome back, ${user?.name || 'there'}. Keep track of your stays in one place.`}</p></div>
      <div className="dashboard-quicklinks">{!admin && !owner && <Link className="btn" to="/properties">Explore stays</Link>}{owner && <Link className="btn" to="/owner/properties/new">+ Add property</Link>}{admin && <Link className="btn" to="/properties">View marketplace</Link>}</div>
    </div>
    <div className="stat-grid">
      {admin && <><div className="stat-card"><span>Total customers & owners</span><strong>{stats?.users ?? '—'}</strong><small>Registered accounts</small></div><div className="stat-card"><span>Properties</span><strong>{stats?.properties ?? '—'}</strong><small>Listed on RentNest</small></div><div className="stat-card"><span>All bookings</span><strong>{stats?.bookings ?? items.length}</strong><small>Across the platform</small></div><div className="stat-card"><span>Collected revenue</span><strong>{money(stats?.revenue)}</strong><small>Payments marked paid</small></div></>}
      {!admin && <><div className="stat-card"><span>Total requests</span><strong>{items.length}</strong><small>All your booking records</small></div><div className="stat-card"><span>Pending</span><strong>{count('pending')}</strong><small>Awaiting a decision</small></div><div className="stat-card"><span>Confirmed</span><strong>{count('confirmed')}</strong><small>Approved bookings</small></div><div className="stat-card"><span>Completed</span><strong>{count('completed')}</strong><small>Finished stays</small></div></>}
    </div>
    <section className="dashboard-list card">
      <div className="list-heading"><div><h2>{admin ? 'All booking requests' : owner ? 'Guest booking requests' : 'Your booking activity'}</h2><p className="muted">{admin ? 'Review, approve and update bookings across RentNest.' : owner ? 'Approve or reject requests for your properties.' : 'Your upcoming and previous stays appear here.'}</p></div>
        <select className="status-filter" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All statuses</option>{['pending','confirmed','rejected','cancelled','completed'].map(status => <option key={status} value={status}>{titleCase(status)}</option>)}</select>
      </div>
      {filtered.length ? <div className="booking-list">{filtered.map(booking => <BookingRow key={booking._id} booking={booking} role={user?.role} refresh={refresh} />)}</div> : <div className="empty-state"><div className="empty-icon">⌂</div><h3>{filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}</h3><p>{owner || admin ? 'New booking requests will appear here when customers reserve a property.' : 'Find a place for your next stay and your booking will show up here.'}</p>{!owner && !admin && <Link className="btn" to="/properties">Explore properties</Link>}</div>}
    </section>
    {(owner || admin) && <p className="dashboard-footnote">Tip: pending requests are not confirmed until you approve them. COD payments can be marked as collected after receiving cash.</p>}
  </main>;
}
