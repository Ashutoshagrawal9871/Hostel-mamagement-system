# HostelHub — Hostel Management System

A beginner-friendly Hostel Management System built with Java, Spring Boot and a simple HTML/CSS/JavaScript frontend.

## Features
- Student registration, listing, editing and deletion
- Room allocation with capacity checks
- Fee record creation and payment status
- Complaint submission and status updates
- Dashboard with student, room, fee and complaint summary

## Technology
- Java 17+
- Spring Boot 3.5.6
- Spring Web (REST APIs)
- HTML, CSS and JavaScript
- Java collections (`LinkedHashMap`) for temporary in-memory storage

**No PostgreSQL, JDBC, MySQL or Hibernate is used.** Data resets when the application stops because this is a simple demonstration version.

## Run in IntelliJ IDEA
1. Extract `hostel-management-system.zip`.
2. Open IntelliJ IDEA.
3. Choose **File → Open** and select the extracted `hostel-management-system` folder (the folder containing `pom.xml`).
4. Allow IntelliJ to load/sync the Maven project. Make sure Project SDK is Java 17 or later.
5. Open `src/main/java/com/hostel/HostelApplication.java`.
6. Click the green Run arrow beside `main`.
7. Wait until the console shows that Tomcat started on port 8090.
8. Open **http://localhost:8090** in your browser.

The first run needs an internet connection so Maven can download Spring Boot dependencies.

## Demo flow for your teacher
1. Open Dashboard.
2. Register two students and allocate them to rooms.
3. Open Room allocation and show occupied/free beds.
4. Record a paid fee for a student.
5. Submit a complaint and change its status from Open to In Progress or Resolved.
6. Return to Dashboard and show the updated summary.

## Main API endpoints
- `GET /api/dashboard`
- `GET, POST /api/students`
- `PUT, DELETE /api/students/{id}`
- `GET /api/rooms`
- `GET, POST /api/fees`
- `GET, POST /api/complaints`
- `PATCH /api/complaints/{id}` with JSON body `{"status":"Resolved"}`

## Notes
- This is a classroom demo, not a production hostel system.
- There is no login/authentication in this version.
- Data is stored only in memory and is lost when the app restarts.
- Room capacity is enforced when students are added or moved.
