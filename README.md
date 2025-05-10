# 🚗 FixnGo - Automobile Service & Repair Platform

**FixnGo** is a full-stack automobile service booking platform where users can connect with verified workshops to request repair and maintenance services. Built using **Django REST Framework (Backend)** and **React + Redux (Frontend)** with real-time features and background task handling.

## 🚀 Features

- 👤 **Multi-role authentication**: User, Workshop, and Admin (JWT-based)
- 📍 **Location-aware workshop discovery**
- 📑 **Workshop registration with document verification**
- ⌛ **Admin approval workflow for workshops & services**
- 💬 **Real-time chat and notifications** (Socket.IO / Django Channels)
- 🔔 **Instant alerts on approvals and service updates**
- 📁 **Document & profile image storage** via **AWS S3**
- 💳 **Secure payments** using **Razorpay**
- 📩 **OTP verification** with Celery & Redis

## 🧰 Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React, Redux Toolkit, Tailwind CSS   |
| Backend     | Django, Django REST Framework        |
| Real-time   | Django Channels, Redis, Socket.IO    |
| Auth        | JWT                                  |
| Storage     | AWS S3                               |
| Queue       | Celery + Redis                       |
| Payment     | Razorpay                             |
| Database    | PostgreSQL                           |

## 🛠 Setup Instructions

### 🔁 Clone the Repository

```bash
git clone https://github.com/SreerajKRajan/FixnGo.git
cd fixngo
```

### ⚙️ Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
python manage.py migrate
python manage.py runserver
```

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 📋 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Database
DB_NAME=fixngo_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
```

## 🧪 Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## 🔄 Workflow

1. Workshops register and submit verification documents
2. Admin approves workshops and their service offerings
3. Users discover nearby workshops and book services
4. Real-time notifications keep all parties updated
5. Secure payments process service fees
6. Feedback and ratings improve service quality

## 📞 Contact

Sreeraj K Rajan - [GitHub](https://github.com/SreerajKRajan)

Project Link: [https://github.com/SreerajKRajan/FixnGo](https://github.com/SreerajKRajan/FixnGo)

---

🎉 **Drive forward with FixnGo!** 🔧🛠️