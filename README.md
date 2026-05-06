# 🗂️ Mini CRM – Client Lead Management System

> **Future Interns – Full Stack Web Development Task 2**

A fully functional Client Lead Management System (Mini CRM) built with the MERN stack. Manage incoming leads, track their status, add follow-up notes, and analyse conversions — all from a secure admin dashboard.

---

## ✨ Features

- 🔐 **Secure Admin Login** — JWT-based authentication
- 📋 **Lead Listing** — Name, email, company, source, status, date
- 🔄 **Status Updates** — new → contacted → converted → lost (inline)
- 📝 **Follow-up Notes** — Add timestamped notes to each lead
- 🔍 **Search & Filter** — By name, email, company, source, status
- 📊 **Analytics Bar** — Total leads, conversion rate at a glance
- ➕ **Add / Edit / Delete** leads from a modal form

---

## 🛠️ Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React.js, Axios               |
| Backend  | Node.js, Express.js           |
| Database | MongoDB Atlas (Mongoose)      |
| Auth     | JWT (JSON Web Tokens), bcrypt |

---

The Mini CRM (Client Lead Management System) is a web-based application developed to help businesses manage and track customer leads efficiently. A lead is a person who shows interest in a business, usually by filling out a contact form on a website. Instead of handling this information manually, the system provides an organized way to store, manage, and update lead details.

When a user submits their information through a contact form, the data is sent to the backend server and stored in a database. This stored information becomes a lead that can be accessed later by the admin. The admin can log in securely to the system and view all the leads in a dashboard interface. Each lead can be updated with a status such as New, Contacted, or Converted, depending on the stage of interaction with the customer.

The system also allows the admin to add follow-up notes for each lead, which helps in maintaining proper communication records. This makes it easier to track progress and ensures that no potential customer is missed. The application is built using React for the frontend, Node.js and Express for the backend, and MongoDB for storing data.

Overall, this project simplifies the process of managing customer leads, reduces manual effort, and improves the chances of converting leads into actual clients. It reflects how real-world businesses and organizations handle customer relationship management in an efficient and structured manner.