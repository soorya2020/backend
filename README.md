# 🧑‍💻 GitTogether

GitTogether is a **developer networking platform** built using the **MERN stack** where developers can connect, collaborate, chat, and grow together.  
It’s designed to bring the tech community closer — a space where coders meet, share ideas, and build meaningful professional connections.

---

## 🚀 Key Features

### 👤 User Authentication
- Secure login and signup using **JWT + HTTP-only cookies**.
- Protected routes ensuring only authenticated users can access feeds or connections.

### 📰 Developer Feeds
- Personalized feed showing other developers.
- Send or ignore connection requests directly from the feed.

### 🤝 Connections
- Manage all your **connection requests**.
- Accept or reject requests in real time.
- View all your existing connections in one place.

### ✏️ Profile Management
- Edit and update your personal profile details.
- Integrated **toast notifications** for better UX feedback.

### 💬 Real-Time Chat
- One-to-one chat between connected users using **Socket.io**.
- Secure socket authentication with user verification.
- Online/offline indicators and message delivery updates (planned).

### 💎 Premium Membership (Razorpay Integration)
- Upgrade to premium with **Razorpay payment gateway**.
- Dynamic order creation and signature verification for secure transactions.
- Premium users enjoy:
  - 🚫 No Ads  
  - ⚡ Priority Access  
  - 🔒 Exclusive Features

### 📧 Automated Email Notifications (AWS SES)
- Integrated **Amazon Simple Email Service (SES)** for sending verified emails.
- Scheduled **cron jobs** to notify users with pending connection requests.

### ☁️ Deployment & Infrastructure
- Hosted on **AWS EC2** with **NGINX reverse proxy**.
- Backend managed with **PM2** for process control and uptime.
- Domain and SSL setup via **Cloudflare** and **Certbot**.

---

## 🛠️ Tech Stack

**Frontend:** React (Vite) + Tailwind CSS + DaisyUI  
**State Management:** Redux Toolkit  
**Backend:** Node.js + Express.js  
**Database:** MongoDB (Mongoose)  
**Authentication:** JWT + Cookies  
**Payments:** Razorpay Integration  
**Email Service:** AWS SES  
**Real-Time:** Socket.io  
**Deployment:** AWS EC2 + NGINX + PM2  

---

## 🧠 What I Learned

- Building **secure full-stack authentication** with cookies and CORS.  
- Integrating **payment systems** and handling **webhook verification**.  
- Implementing **real-time chat** using Socket.io with authentication.  
- Managing deployments and SSL configurations on AWS.  
- Automating backend processes using **cron jobs** and **SES** for email delivery.

---

## ✨ Summary

GitTogether is a **complete, production-ready MERN application** that showcases:
- Real-world engineering practices  
- Secure integrations  
- Scalable architecture  
- Polished UI with DaisyUI themes  

It reflects a strong command of **full-stack development, payments, and deployment workflows**, making it a great project for both portfolio and professional demonstration.

---

**Author:** Soorya Krishnanunni  
💼 Full Stack Developer | MERN | AWS | System Design  
🔗 [LinkedIn](https://www.linkedin.com/in/soorya-krishnanunni/) • [GitHub](https://github.com/soorya2020)
