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


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/home' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/connect-tele' element={<Step1 />} />
        <Route path='/activate-bot' element={<Step2 />} />
        <Route path='/dash-board' element={<DashBoard />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/reminders' element={<ReminderPage />} />
        <Route path='/profile' element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}
