import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Function to fetch user data from backend
  const fetchUser = async () => {
    try {
      const res = await axios.get('https://pingmyphone.onrender.com/test', { withCredentials: true });
      if (res.data.message === 'Session is working') {
        setUser({
          username: res.data.username,
          usermail: res.data.usermail,
          telegramID: res.data.telegramID
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  useEffect(() => {
    // Fetch the current user on app load to maintain session state
    fetchUser();
  }, []);

  const login = async (usermail, password) => {
    try {
      const res = await axios.post(
        'https://pingmyphone.onrender.com/login',
        { usermail, password },
        { withCredentials: true }
      );
      if (res.status === 200) {
        // After successful login, fetch updated user data
        await fetchUser();
        return { success: true, firstLogin: res.data.first_login };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const addTelegramID = async (telegramID) => {
    try {
      const res = await axios.post(
        'https://pingmyphone.onrender.com/addTelegramID',
        { telegramID },
        { withCredentials: true }
      );
      
      if (res.status === 200) {
        // Update local state immediately with all fields preserved
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            telegramID
          };
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error adding Telegram ID:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to add Telegram ID' };
    }
  };

  const updateProfile = async (username, telegramID) => {
    try {
      const res = await axios.post(
        'https://pingmyphone.onrender.com/profileChange',
        { username, telegramID },
        { withCredentials: true }
      );
      
      if (res.status === 200) {
        // Update local state immediately, with all fields preserved
        setUser(prevUser => {
          if (!prevUser) return null;
          
          return {
            ...prevUser,
            username: username || prevUser.username,
            telegramID: telegramID || prevUser.telegramID
          };
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const res = await axios.post(
        'https://pingmyphone.onrender.com/changePassword',
        { newPassword },
        { withCredentials: true }
      );
      
      if (res.status === 200) {
        return { success: true };
      }
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to change password' };
    }
  };

  const logout = async () => {
    try {
      const res = await axios.post(
        'https://pingmyphone.onrender.com/logout',
        {},
        { withCredentials: true }
      );
      if (res.data.loggedOut) {
        setUser(null);
        return { success: true };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.response?.data?.message || 'Logout failed' };
    }
  };

  // Expose the fetchUser function to allow manual refreshes
  const refreshUserData = () => fetchUser();

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        login, 
        logout, 
        addTelegramID,
        updateProfile,
        changePassword,
        refreshUserData 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};