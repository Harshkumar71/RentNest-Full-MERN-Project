# RentNest — MERN rental booking platform

This version includes customer booking requests, owner/admin booking management, booking status tracking, and Cash on Delivery (COD) payment recording.

## What's included

- Customer, property-owner and admin roles with JWT authentication
- Property discovery, filters, details, owner listing management and reviews
- Customer booking requests with dates, guest count and an optional note
- Server-side date, guest-limit and overlapping-booking validation
- Customer dashboard to track and cancel pending/confirmed bookings
- Owner dashboard to approve/reject requests and complete confirmed stays
- Admin dashboard with platform statistics and all booking requests
- COD payment tracking; owners/admins can mark cash as collected after confirming a booking
- Responsive refreshed dashboard and property booking UI

> Online card checkout is shown as coming soon and is deliberately disabled. The existing Stripe API scaffold is not a complete production checkout flow. COD is the working payment option in this update.

## Requirements

- Node.js 18 or newer (Node 20 LTS recommended)
- MongoDB local installation or a MongoDB Atlas connection string
- npm
- Optional: Cloudinary credentials if you want hosted property image uploads

## 1. Extract and configure

Extract the ZIP. Open the extracted `RentNest-Full-MERN-Project` folder in VS Code.

Create `server/.env` by copying `server/.env.example`, then set at least:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rentnest
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string. Do not commit `.env` files or share their contents.

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Cloudinary values are optional for local development. Add your own Cloudinary credentials in `server/.env` if your image-upload feature requires them.

## 2. Install dependencies

Open a terminal in the project root and install backend and frontend packages:

```bash
cd server
npm install
cd ../client
npm install
```

## 3. Start the backend

In terminal 1:

```bash
cd server
npm run dev
```

The API should start at `http://localhost:5000`. Visit that address to see the API status response.

## 4. Start the frontend

In terminal 2:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## 5. Create an admin account

1. Register a normal account in the app using the email you want for the admin.
2. Stop neither server nor frontend; open a third terminal.
3. Run this from the `server` folder:

```bash
npm run make-admin -- your-email@example.com
```

4. Log out of RentNest and log in again. The account will now see the Admin overview and all booking requests.

Public registration intentionally only creates customer or owner accounts; users cannot make themselves admins from the registration form.

## 6. Test the booking flow

1. Register a customer account.
2. Register a separate owner account.
3. Log in as the owner and add a property from **List a property**.
4. Log in as the customer in another browser/incognito window, open that property, select check-in/check-out dates and guests, and choose **Cash on Delivery**.
5. Submit **Request booking**. It appears as Pending in the customer's dashboard and the owner's dashboard.
6. Log in as the owner and select **Approve** or **Reject**.
7. Once approved, the customer sees Confirmed. After cash is collected, the owner can select **Mark COD paid**.
8. The owner can mark the confirmed stay as Completed after checkout.

A booking request is not a confirmed reservation until the owner/admin approves it. Pending and confirmed requests block overlapping date requests for the same property.

## Useful API routes

- `POST /api/bookings` — customer creates a booking request
- `GET /api/bookings/my` — customer's own bookings
- `GET /api/bookings/owner` — bookings for the signed-in owner's properties
- `GET /api/bookings/admin` — all bookings (admin only)
- `PATCH /api/bookings/:id/status` — permitted booking status update
- `PATCH /api/bookings/:id/payment-status` — owner/admin records COD collection
- `GET /api/admin/stats` — admin dashboard statistics

## Troubleshooting

- **MongoDB connection error:** check that MongoDB is running and `MONGO_URI` is correct.
- **Network/API error in browser:** make sure the backend is running on port 5000 and `client/.env` points to `http://localhost:5000/api`.
- **Admin dashboard not visible:** run the `make-admin` command, then log out and log in again.
- **Image uploads fail:** configure Cloudinary credentials in `server/.env` or use a valid image URL if supported by your existing property form.
