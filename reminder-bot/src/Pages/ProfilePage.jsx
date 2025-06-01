import { useUser } from '../Context/UserContext.jsx';
import '../Styles/PageStyles/ProfilePage.css';
import React, { useState } from 'react';
import Navbar from '../Components/Navbar.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [alertmsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  function ShowAlert(message, type = 'success') {
    setAlertMsg(message);
    setAlertType(type);
    console.log(message);
    setTimeout(() => {
      setAlertMsg('');
      setAlertType('');
    }, 3000);
  }

  const navigate = useNavigate();
  const { user, updateProfile, logout: contextLogout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    telegramID: ''
  });

  async function handleLogout() {
    const result = await contextLogout();
    if (result.success) {
      navigate('/');
    }
  }

  async function handleProfileChange() {
    setUpdating(true);
    if (formData.username != user.username || formData.telegramID != user.telegramID) {
      try {
        // Use the updateProfile method from context
        const result = await updateProfile(formData.username, formData.telegramID);
        
        if (result.success) {
          ShowAlert("Profile updated successfully", 'success');
        } else {
          ShowAlert(result.error || "Profile update failed", 'error');
        }
      } catch (err) {
        console.log(err);
        ShowAlert("Profile update failed! Try again", 'error');
      } finally {
        setUpdating(false);
      }
    } else {
      ShowAlert("No changes detected to update!", 'info');
      setUpdating(false);
    }
  }

  if (!user) return <div>Loading profile...</div>;

  const handleEditClick = () => {
    setFormData({
      username: user.username,
      telegramID: user.telegramID || ''
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdate = () => {
    setIsEditing(false);
    handleProfileChange();
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleOldPasswordCheck = async () => {
    setVerifying(true);
    try {
      const response = await axios.post('https://pingmyphone.onrender.com/checkPassword', {
        oldPassword: passwordData.oldPassword
      }, { withCredentials: true });

      if (response.data.valid) {
        setIsVerified(true);
        ShowAlert("Old password verified!", 'success');
      } else {
        ShowAlert("Incorrect old password", 'error');
      }
    } catch (err) {
      ShowAlert("Verification failed", 'error');
    } finally {
      setVerifying(false);
    }
  };

  async function PasswordChange() {
    if (passwordData.newPassword === passwordData.confirmPassword) {
      try {
        const response = await axios.post('https://pingmyphone.onrender.com/changePassword', {
          newPassword: passwordData.newPassword
        }, { withCredentials: true });
        
        ShowAlert("Password changed successfully", 'success');
        setShowPasswordModal(false);
        setIsVerified(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } catch(err) {
        console.log(err);
        ShowAlert("Password change failed", 'error');
      }
    } else {
      ShowAlert("New passwords don't match", 'error');
    }
  }

  return (
    <>
      {updating && (
        <div className="loading-box">
          <div className="spinner">
          </div>
            <p>Updating your profile...</p>
        </div>
      )}

      <Navbar />

      <div className="body"></div>
      <div className="profile-container">
        <button className="changepword" onClick={() => setShowPasswordModal(true)}>
          <FontAwesomeIcon icon={faKey} /> <span>Change Password</span>
        </button>

        <div className="profile-card">
          <h2 className="profile-title">Profile</h2>
          <div className="profilerefText">
            {user.username?.[0] ?? '-'}
          </div>
          <div className="profile-info">
            <div className="profile-field">
              <p className="field-label">Name</p>
              <p className="field-value">{user.username}</p>
            </div>
            <div className="profile-field">
              <p className="field-label">Email</p>
              <p className="field-value">{user.usermail}</p>
            </div>
            <div className="profile-field">
              <p className="field-label">TelegramID</p>
              <p className="field-value">{user.telegramID || 'Not set'}</p>
            </div>
          </div>
          <div className="profile-actions">
            <button className="edit-button profile-action-button" onClick={handleEditClick}>
              Edit
            </button>
            <button className="logout-button profile-action-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* EDIT MODAL */}
        {isEditing && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Your Profile</h3>
              <div className="profinput">
                <p>Username</p>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Name"
                />
              </div>
              <div className="profinput">
                <p>TelegramID</p>
                <input
                  type="text"
                  name="telegramID"
                  value={formData.telegramID}
                  onChange={handleInputChange}
                  placeholder="Telegram ID"
                />
              </div>

              <div className="modal-buttons">
                <button onClick={handleUpdate}>Update</button>
                <button className='cancel' onClick={() => {
                  setIsEditing(false);
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* PASSWORD MODAL */}
        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Change Your Password</h3>

              <div className="profinput">
                <p>Old Password</p>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter old password"
                  disabled={isVerified}
                />
                <button
                  className='check'
                  onClick={handleOldPasswordCheck}
                  disabled={verifying || isVerified}
                  style={{
                    backgroundColor: isVerified ? 'green' : '',
                    border: 'none !important',
                    color: isVerified ? 'white' : '',
                    cursor: isVerified ? 'default' : 'pointer'
                  }}
                >
                  {isVerified ? "Verified" : (verifying ? "Verifying..." : "Verify")}
                </button>
              </div>

              <div className="profinput">
                <p>New Password</p>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter new password"
                  disabled={!isVerified}
                />
              </div>

              <div className="profinput">
                <p>Confirm New Password</p>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Confirm new password"
                  disabled={!isVerified}
                />
              </div>

              <div className="password-buttons">
                <button disabled={!isVerified} onClick={PasswordChange} className='update'>
                  Update
                </button>
                <button className='cancel' onClick={() => {
                  setShowPasswordModal(false);
                  setIsVerified(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {alertmsg && (
        <div className={`custom-alert ${alertType}`}>{alertmsg}</div>
      )}
    </>
  );
};

export default ProfilePage;