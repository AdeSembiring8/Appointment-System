### 1. _Timezone Conflicts_: How would you handle timezone conflicts between participants in an appointment?
- The backend retrieves the user's preferred timezone from the database (user.preferred_timezone).
- Appointments are stored in UTC and converted to the user's local timezone when fetched:
```bash
ppointments = appointments.map(appt => ({
    ...appt._doc,
    start: moment.utc(appt.start).tz(userTimezone).format("YYYY-MM-DD HH:mm:ss"),
    end: moment.utc(appt.end).tz(userTimezone).format("YYYY-MM-DD HH:mm:ss"),
}));
```

### 2. _Database Optimization_: How can you optimize database queries to efficiently fetch user-specific appointments?
- Using Direct Query to Database
- API already uses populate() to retrieve user details (creator_id and participants), thus reducing additional queries to the database
- Using Sorting

### 3. _Additional Features_: If this application were to become a real product, what additional features would you implement? Why?
- **Notifications & Reminders**: Send email/SMS/push notification before the appointment.
- **Calendar Integration**: Synchronize with Google Calendar, Outlook, etc.
  - Currently, to view appointments, you must login to the website.

### 4. _Session Management_: How would you manage user sessions securely while keeping them lightweight (e.g., avoiding large JWT payloads)?
- The minimum information in JWT is only user_id
- Token will be destroyed after 1 hour
