import { useUser } from '../Context/UserContext.jsx';
import '../Styles/PageStyles/ProfilePage.css';
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faUser, faEnvelope, faEdit, faSignOutAlt, faTimes, faCheck, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  useEffect(() => {
    logCheck();
  }, []);

  async function logCheck() {
    const response = await axios.get('https://pingmyphone.onrender.com/status-check',
      { withCredentials: true }
    )

    if (!response.data.logged) {
      navigate('/login');
    }
  }

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
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  function ShowAlert(message, type = 'success') {
    setAlertMsg(message);
    setAlertType(type);
    console.log(message);
    setTimeout(() => {
      setAlertMsg('');
      setAlertType('');
    }, 4000);
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
    if (formData.username !== user.username || formData.telegramID !== user.telegramID) {
      try {
        const result = await updateProfile(formData.username, formData.telegramID);

        if (result.success) {
          ShowAlert("Profile updated successfully", 'success');
          setIsEditing(false);
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

  if (!user) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
  );

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

  const handlePasswordInputChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleOldPasswordCheck = async () => {
    if (!passwordData.oldPassword) {
      ShowAlert("Please enter your old password", 'error');
      return;
    }
    
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
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      ShowAlert("Please fill in all password fields", 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      ShowAlert("New password must be at least 6 characters long", 'error');
      return;
    }

    if (passwordData.newPassword === passwordData.confirmPassword) {
      try {
        const response = await axios.post('https://pingmyphone.onrender.com/changePassword', {
          newPassword: passwordData.newPassword
        }, { withCredentials: true });

        ShowAlert("Password changed successfully", 'success');
        setShowPasswordModal(false);
        setIsVerified(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswords({ old: false, new: false, confirm: false });
      } catch (err) {
        console.log(err);
        ShowAlert("Password change failed", 'error');
      }
    } else {
      ShowAlert("New passwords don't match", 'error');
    }
  }

  const resetPasswordModal = () => {
    setShowPasswordModal(false);
    setIsVerified(false);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswords({ old: false, new: false, confirm: false });
  };

  return (
    <>
      {updating && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Updating your profile...</p>
          </div>
        </div>
      )}

      <Navbar />

      <div className="profile-page">
        <div className="profile-header">
          <button className="change-password-btn" onClick={() => setShowPasswordModal(true)}>
            <FontAwesomeIcon icon={faKey} />
            <span>Change Password</span>
          </button>
        </div>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-title">My Profile</h2>
              <div className="profile-avatar">
                <span>{user.username?.[0]?.toUpperCase() ?? 'U'}</span>
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-field">
                <div className="field-icon">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="field-content">
                  <label className="field-label">Username</label>
                  <p className="field-value">{user.username}</p>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className="field-content">
                  <label className="field-label">Email Address</label>
                  <p className="field-value">{user.usermail}</p>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <FontAwesomeIcon icon={faTelegram} />
                </div>
                <div className="field-content">
                  <label className="field-label">Telegram ID</label>
                  <p className="field-value">{user.telegramID || 'Not configured'}</p>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="edit-btn" onClick={handleEditClick}>
                <FontAwesomeIcon icon={faEdit} />
                <span>Edit Profile</span>
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* EDIT MODAL */}
        {isEditing && (
          <div className="modal-overlay">
            <div className="modal-content edit-modal">
              <div className="modal-header">
                <h3>Edit Profile</h3>
                <button className="close-btn" onClick={() => setIsEditing(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleProfileChange(); }}>
                <div className="form-group">
                  <label htmlFor="username">
                    <FontAwesomeIcon icon={faUser} />
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telegramID">
                    <FontAwesomeIcon icon={faTelegram} />
                    Telegram ID
                  </label>
                  <input
                    id="telegramID"
                    type="text"
                    name="telegramID"
                    value={formData.telegramID}
                    onChange={handleInputChange}
                    placeholder="Enter your Telegram ID"
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="save-btn" disabled={updating}>
                    <FontAwesomeIcon icon={faCheck} />
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PASSWORD MODAL */}
        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal-content password-modal">
              <div className="modal-header">
                <h3>Change Password</h3>
                <button className="close-btn" onClick={resetPasswordModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form className="modal-form" onSubmit={(e) => { e.preventDefault(); PasswordChange(); }}>
                <div className="form-group">
                  <label htmlFor="oldPassword">
                    <FontAwesomeIcon icon={faKey} />
                    Current Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="oldPassword"
                      type={showPasswords.old ? "text" : "password"}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter current password"
                      disabled={isVerified}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('old')}
                    >
                      <FontAwesomeIcon icon={showPasswords.old ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {!isVerified && (
                    <button
                      type="button"
                      className="verify-btn"
                      onClick={handleOldPasswordCheck}
                      disabled={verifying || !passwordData.oldPassword}
                    >
                      {verifying ? 'Verifying...' : 'Verify Password'}
                    </button>
                  )}
                  {isVerified && (
                    <div className="verification-status">
                      <FontAwesomeIcon icon={faCheck} />
                      Password verified
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <FontAwesomeIcon icon={faKey} />
                    New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter new password"
                      disabled={!isVerified}
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      <FontAwesomeIcon icon={showPasswords.new ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <FontAwesomeIcon icon={faKey} />
                    Confirm New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Confirm password"
                      disabled={!isVerified}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      <FontAwesomeIcon icon={showPasswords.confirm ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="save-btn" disabled={!isVerified}>
                    <FontAwesomeIcon icon={faCheck} />
                    Change Password
                  </button>
                  <button type="button" className="cancel-btn" onClick={resetPasswordModal}>
                    <FontAwesomeIcon icon={faTimes} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>


      {alertmsg && (
        <div className={`alert-notification ${alertType}`}>
          <div className="alert-content">
            <FontAwesomeIcon 
              icon={alertType === 'success' ? faCheck : alertType === 'error' ? faExclamationTriangle : faInfoCircle} 
            />
            <span>{alertmsg}</span>
          </div>
        </div>
      )}
    </>
  );
};


export default ProfilePage;