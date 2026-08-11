# Calenvo 📅

Calenvo is a feature-rich, full-stack Google Calendar clone designed for seamless time management and scheduling. Built with a modern tech stack, it provides an intuitive, responsive, and highly interactive user experience.

## ✨ Features

- **Dynamic Views**: Seamlessly switch between Month, Week, and Day views to visualize your schedule your way.
- **Advanced Event Management**: Create, edit, and delete events with support for all-day events, custom durations, and Google Meet integration.
- **Recurring Events**: Powerful recurring event support (daily, weekly, monthly) with the ability to edit "this event", "this and following", or "all events".
- **Conflict Detection**: Intelligent time-conflict detection alerts you when trying to schedule overlapping events.
- **Interactive UI**: Drag-and-drop support, beautiful modals, and a polished Material UI design that mimics the premium feel of Google Calendar.
- **Authentication**: Secure user registration and login system.
- **Customization**: Assign different colors to events, set custom notifications, and manage multiple calendars.

## 🛠️ Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) (React Framework)
- [Material UI (MUI)](https://mui.com/) (Component Library & Styling)
- [TypeScript](https://www.typescriptlang.org/)
- [date-fns](https://date-fns.org/) (Date manipulation)

**Backend:**
- [NestJS](https://nestjs.com/) (Node.js Framework)
- [Prisma ORM](https://www.prisma.io/) (Database Access)
- [PostgreSQL](https://www.postgresql.org/) (Database)
- [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aryan-Diggal/Calenvo-Calender.git
   cd Calenvo
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Set up your .env file with your PostgreSQL DATABASE_URL
   # Example: DATABASE_URL="postgresql://user:password@localhost:5432/calenvo?schema=public"
   
   # Run Prisma migrations
   npx prisma migrate dev
   
   # Start the backend server
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start the frontend development server
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application in action!

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the MIT License.
