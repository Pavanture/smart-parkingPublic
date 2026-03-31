require("dotenv").config();
const express = require("express");

const cors = require("cors");
const db = require("./db");

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Smart Parking backend is running");
});
console.log("MYSQL PROJECT STARTED");

/* ---------------- DATABASE CONNECTION ---------------- */

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully");
  }
});

/* ---------------- SIGNUP ---------------- */

app.post("/signup", (req, res) => {
  const { name, email, password, phone } = req.body;

  const sql = "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, password, phone], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database Error" });
    }

    res.json({ message: "User Registered Successfully" });
  });
});

/* ---------------- LOGIN ---------------- */

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      },
    });
  });
});

/* ---------------- ADMIN DASHBOARD ---------------- */

app.get("/admin/dashboard", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS totalBookings,

      SUM(CASE WHEN booking_status = 'Active' THEN 1 ELSE 0 END) AS activeBookings,
      SUM(CASE WHEN booking_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelledBookings,
      SUM(CASE WHEN booking_status = 'Expired' THEN 1 ELSE 0 END) AS expiredBookings,

      SUM(CASE WHEN payment_status = 'Success' THEN amount ELSE 0 END) AS totalRevenue,
      SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END) AS totalRefunded

    FROM bookings
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching dashboard data" });
    }

    res.json(results[0]);
  });
});

/* ---------------- USER BOOKING HISTORY ---------------- */

app.get("/my-bookings/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT *,
    CASE 
      WHEN expiry_time > NOW() THEN 'Active'
      ELSE 'Expired'
    END AS status
    FROM bookings
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching bookings" });
    }

    res.json({
      totalBookings: results.length,
      bookings: results,
    });
  });
});

/* ---------------- AVAILABLE SLOTS ---------------- */

app.get("/available-slots/:location/:vehicleType", (req, res) => {
  const { location, vehicleType } = req.params;

  let allSlots = [];

  if (vehicleType === "Normal") {
    allSlots = ["N1", "N2", "N3", "N4", "N5"];
  } else if (vehicleType === "Electric") {
    allSlots = ["E1", "E2"];
  } else {
    return res.status(400).json({ message: "Invalid vehicle type" });
  }

  const sql = `
    SELECT slot FROM bookings
    WHERE location = ?
    AND vehicle_type = ?
    AND booking_status = 'Active'
  `;

  db.query(sql, [location, vehicleType], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error checking slots" });
    }

    const bookedSlots = results.map((r) => r.slot);

    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    res.json({
      location,
      vehicleType,
      totalSlots: allSlots.length,
      bookedSlots,
      availableSlots,
    });
  });
});

/* ---------------- BOOK SLOT ---------------- */

app.post("/book", (req, res) => {
  const {
    user_id,
    location,
    slot,
    vehicle_type,
    vehicle_number,
    phone,
    hours,
    amount,
    payment_mode,
  } = req.body;

  const checkSql = `
    SELECT * FROM bookings
    WHERE location = ?
    AND slot = ?
    AND booking_status = 'Active'
  `;

  db.query(checkSql, [location, slot], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const insertSql = `
      INSERT INTO bookings 
      (user_id, location, slot, vehicle_type, vehicle_number, phone, hours, amount, payment_mode, expiry_time, booking_status, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 'Success')
    `;

    db.query(
      insertSql,
      [
        user_id,
        location,
        slot,
        vehicle_type,
        vehicle_number,
        phone,
        hours,
        amount,
        payment_mode,
        expiry,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Booking failed" });
        }

        res.json({
          message: "Booking successful (Fake Payment)",
          bookingId: result.insertId,
          expiry_time: expiry,
        });
      }
    );
  });
});

/* ---------------- CANCEL BOOKING ---------------- */

app.put("/cancel-booking/:bookingId", (req, res) => {
  const bookingId = req.params.bookingId;

  const sql = `
    UPDATE bookings 
    SET booking_status = 'Cancelled',
        payment_status = 'Refunded'
    WHERE id = ? AND booking_status = 'Active'
  `;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error cancelling booking" });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Booking already cancelled or expired",
      });
    }

    res.json({
      message: "Booking cancelled and refund processed (Fake)",
    });
  });
});

/* ---------------- AUTO EXPIRE BOOKINGS ---------------- */

app.put("/expire-bookings", (req, res) => {
  const sql = `
    UPDATE bookings
    SET booking_status = 'Expired'
    WHERE expiry_time <= NOW()
    AND booking_status = 'Active'
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error expiring bookings" });
    }

    res.json({
      message: "Expired bookings updated",
      expiredCount: result.affectedRows,
    });
  });
});

/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});