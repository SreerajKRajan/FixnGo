# 🚗 FixnGo - Automobile Service & Repair Platform

**FixnGo** is a full-stack automobile service booking platform where users can connect with verified workshops to request repair and maintenance services. Built using **Django REST Framework (Backend)** and **React + Redux (Frontend)** with real-time features and background task handling.

---

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

---

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

---

## 🛠 Setup Instructions

### 🔁 1. Clone the Repository

```bash
git clone https://github.com/SreerajKRajan/FixnGo.git
cd fixngo

⚙️ 2. Backend Setup

cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

💡 Ensure you configure a .env file with necessary secrets like AWS, DB credentials, email config, etc.

💻 3. Frontend Setup

cd frontend
npm install
npm run dev

🎉 You're All Set!
Your FixnGo platform is now live locally! Users can discover workshops, book services, chat in real-time, and enjoy a secure and smooth experience for all their vehicle repair and service needs.

Happy coding! 💻✨ For issues or contributions, please refer to the project documentation or open an issue in the repository.

🏁 Drive forward with FixnGo! 🔧🛠️