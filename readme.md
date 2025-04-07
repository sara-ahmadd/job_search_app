# Job Search App – Backend

This is the backend of the **Job Search App**, a platform that connects job seekers with companies. It enables company owners or HR personnel to:

- Post job opportunities
- Receive and manage job applications
- Send acceptance or rejection emails to applicants
- Initiate chat conversations with applicants (chat must be initiated by HR or owner)

---

## Getting Started

### Development

```bash
npm install
npm run dev
```

### Production

```bash
npm run build
npm run start
```

---

## Deployment

- **Dockerized** for containerized environments.
- **Deployed on [Vercel](https://job-search-app-gold.vercel.app/)** for easy and scalable hosting.

---

## Authentication Endpoints

All `POST` requests are under the `/auth` route.

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| POST   | `/auth/register`        | Register a new user       |
| POST   | `/auth/confirm-otp`     | Confirm OTP code          |
| POST   | `/auth/login`           | Login using credentials   |
| POST   | `/auth/login-google`    | Login with Google         |
| POST   | `/auth/signup-google`   | Sign up with Google       |
| POST   | `/auth/forget-password` | Send reset password email |
| POST   | `/auth/reset-password`  | Reset user password       |
| POST   | `/auth/refresh-token`   | Get new access token      |

---

## Company Endpoints

These endpoints allow HRs or company owners to manage company profiles and their branding.

| Method | Endpoint                      | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| POST   | `/company`                    | Add a new company            |
| PATCH  | `/company`                    | Update an existing company   |
| GET    | `/company/delete/:id`         | Soft delete a company by ID  |
| GET    | `/company/:id`                | Get a specific company by ID |
| GET    | `/company/find-by-name/:name` | Find a company by name       |
| POST   | `/company/logo`               | Upload company logo          |
| POST   | `/company/cover-picture`      | Upload company cover picture |
| DELETE | `/company/logo`               | Delete company logo          |
| DELETE | `/company/cover-picture`      | Delete company cover picture |

---

## User Endpoints

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| PATCH  | `/user`                 | Update user                |
| GET    | `/user/profile`         | Get current user's profile |
| GET    | `/user/:id`             | View another user          |
| POST   | `/user/password`        | Update password            |
| POST   | `/user/profile-picture` | Upload profile picture     |
| POST   | `/user/cover-picture`   | Upload cover picture       |
| DELETE | `/user/profile-picture` | Delete profile picture     |
| DELETE | `/user/cover-picture`   | Delete cover picture       |
| GET    | `/user/delete/:id`      | Soft delete user account   |

---

## Job Endpoints

| Method | Endpoint      | Description                 |
| ------ | ------------- | --------------------------- |
| POST   | `/job`        | Add job by owner or HR only |
| PATCH  | `/job/:id`    | Update job by owner         |
| DELETE | `/job/:id`    | Delete job by owner         |
| GET    | `/job`        | Get all jobs                |
| GET    | `/job/filter` | Get all jobs with filters   |

---

## Application Endpoints

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| POST   | `/application`            | Apply for job                  |
| GET    | `/application/:jobId`     | Get all applications for a job |
| PATCH  | `/application/:id/status` | Update job application status  |

---

## Tech Stack

This backend is built using:

- **Node.js + Express** for server-side logic
- **MongoDB + Mongoose** for database management
- **Socket.IO** for real-time chat functionality
- **GraphQL** for managing dashboard-related endpoints
- **Nodemailer** for sending acceptance/rejection emails

---

## Contact & Contribution

Feel free to open issues or submit pull requests.

---

## Built with : **_Sara Ahmad_**
