# Parking Management System

A high-performance, real-time parking management web application built with **React**, **TypeScript**, and **Supabase**. This system provides a seamless experience for managing parking slots, vehicle entries/exits, and generating detailed analytical reports.

---

## Key Features

- **Dual-Role Authentication**: Secure login for both Administrators and Staff members.
- **Interactive Dashboard**: Real-time overview of occupancy, recent traffic, and key metrics.
- **Real-time Slot Monitoring**: Visual tracking of occupied and vacant parking spaces.
- **Vehicle Entry & Exit**: Quick processing of vehicle log-ins and log-outs with automatic duration calculation.
- **Advanced Analytics**: Dynamic charts and reports powered by **Recharts** for usage trends and revenue data.
- **Admin Management**: Comprehensive settings panel for managing users, system configurations, and data cleanup.
- **Responsive Design**: Fully responsive UI tailored for both desktop and mobile devices.

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Styling**: Vanilla CSS (Modern CSS variables and flexbox/grid)

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase project

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/ShivaniSingla/Parking-Management-System.git
cd parking-management-system
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Execute the SQL commands provided in [schema.sql](schema.sql) and [schema_updates.sql](schema_updates.sql) within your Supabase SQL Editor to initialize the required tables and functions.

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## Project Structure

```text
parking-management-system/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context for state management
│   ├── lib/             # Supabase client and utility functions
│   ├── models/          # TypeScript interfaces and data models
│   ├── pages/           # Individual page components (Admin, Staff, Entries, etc.)
│   ├── styles/          # Global and component-specific styles
│   ├── types/           # Global type definitions
│   └── App.tsx          # Main application component & routes
├── schema.sql           # Initial database schema
├── schema_updates.sql   # Database schema updates
└── vite.config.ts       # Vite configuration
```

---

## 🌐 Deployment

The project is configured for deployment on **Vercel** and **GitHub Pages**.

### Vercel
Push your changes to a GitHub repository and link it to Vercel. Ensure the environment variables are set in the Vercel project settings.

### GitHub Pages
Run the following command to deploy:
```bash
npm run deploy
```

---

