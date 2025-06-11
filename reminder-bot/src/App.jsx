import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './Pages/HomePage.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import Step1 from './Components/Step1.jsx';
import Step2 from './Components/Step2.jsx';
import DashBoard from './Pages/DashBoard.jsx';
import ContactPage from './Pages/ContactPage.jsx';
import ReminderPage from './Pages/ReminderPage.jsx';
import ProfilePage from './Pages/ProfilePage.jsx';
import LandingPage from './Pages/LandingPage.jsx';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='https://ping-my-phone.vercel.app/home' element={<HomePage />} />
        <Route path='https://ping-my-phone.vercel.app/login' element={<LoginPage />} />
        <Route path='https://ping-my-phone.vercel.app/connect-tele' element={<Step1 />} />
        <Route path='https://ping-my-phone.vercel.app/activate-bot' element={<Step2 />} />
        <Route path='https://ping-my-phone.vercel.app/dash-board' element={<DashBoard />} />
        <Route path='https://ping-my-phone.vercel.app/contact' element={<ContactPage />} />
        <Route path='https://ping-my-phone.vercel.app/reminders' element={<ReminderPage />} />
        <Route path='https://ping-my-phone.vercel.app/profile' element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}
