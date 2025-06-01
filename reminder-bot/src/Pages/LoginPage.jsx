import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logbg from '../assets/Images/Log-bg.jpg';
import telegram from '../assets/Images/Telegram.png';
import '../Styles/PageStyles/LoginPage.css';
import { useUser } from '../Context/UserContext.jsx'; // Import the UserContext

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [signupData, setSignupData] = useState({
    username: '',
    usermail: '',
    password: ''
  });

  const [loginData, setLoginData] = useState({
    usermail: '',
    password: ''
  });

  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('');
  const [isRegistering, setRegistering] = useState(false);
  const [isLogging, setLogging] = useState(false);

  function Focus(e) {
    e.target.parentElement.querySelector('label').style.top = '-60%';
    e.target.parentElement.querySelector('label').style.color = '#fff';
    e.target.parentElement.querySelector('label').style.fontWeight = '600';
  }

  function Notfocus(e) {
    if (!e.target.value) {
      e.target.parentElement.querySelector('label').style.top = '25%';
      e.target.parentElement.querySelector('label').style.color = '#666';
      e.target.parentElement.querySelector('label').style.fontWeight = '500';
    }
  }

  function MoveToSignIn() {
    document.querySelector('.form-box').style.transform = 'translateX(-25%)';
  }

  function MoveToSignUp() {
    document.querySelector('.form-box').style.transform = 'translateX(25%)';
  }

  const showAlert = (message, type = 'success') => {
    setAlertMsg(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMsg('');
      setAlertType('');
    }, 3000);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setRegistering(true);
      const res = await axios.post('https://pingmyphone.onrender.com/register', signupData);
      showAlert(res.data.message || '✅ Registered successfully!', 'success');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '❌ Registration failed. Please try again.';
      showAlert(errorMessage, 'error');
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      setLogging(true);
      const response = await axios.post('https://pingmyphone.onrender.com/login', loginData, {
        withCredentials: true
      });
      showAlert(response.data.message || '✅ Logged in successfully!', 'success');

      const userRes = await axios.get('https://pingmyphone.onrender.com/test', {
        withCredentials: true,
      });

      if (userRes.data.message === 'Session is working') {
        setUser({
          username: userRes.data.username,
          usermail: userRes.data.usermail,
          telegramID: userRes.data.telegramID,
        });
      }

      const { first_login } = response.data;
      if (first_login) {
        navigate('/connect-tele');
      } else {
        navigate('/dash-board');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '❌ Login failed. Please try again.';
      showAlert(errorMessage, 'error');
      console.error(err);
    } finally {
      setLogging(false);
    }
  };


  return (
    <>
      {isRegistering && (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Verifying your credentials...</p>
        </div>
      )}

      {isLogging && (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Verifying your credentials...</p>
        </div>
      )}

      <div className="logpage">
        <div className="imgarea">
          <img src={logbg} alt="" />
          <img className='tele' src={telegram} alt="" />
        </div>

        <div className="formarea">
          <div className="desarea">
            <h1 className="title">Ping My Phone</h1>
            <p>Your personal Telegram reminder!</p>
          </div>

          <div className="form-wrapper">
            <div className="form-box">
              {/* Sign Up Form */}
              <div className="form">
                <h2>SignUp</h2>
                <form onSubmit={handleSignUp}>
                  <div className="formdiv">
                    <label>UserName</label>
                    <input
                      required
                      type="text"
                      name="username"
                      onFocus={Focus}
                      onBlur={Notfocus}
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    />
                  </div>
                  <div className="formdiv">
                    <label>Email</label>
                    <input
                      required
                      type="email"
                      name="Email"
                      onFocus={Focus}
                      onBlur={Notfocus}
                      value={signupData.usermail}
                      onChange={(e) => setSignupData({ ...signupData, usermail: e.target.value })}
                    />
                  </div>
                  <div className="formdiv">
                    <label>Password</label>
                    <input
                      required
                      type="password"
                      name="password"
                      onFocus={Focus}
                      onBlur={Notfocus}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    />
                  </div>
                  <button className='regbutton actionbutton'>Register</button>
                  <p>Already have an account? <a onClick={MoveToSignIn}>SignIn</a></p>
                </form>
              </div>

              {/* Sign In Form */}
              <div className="form">
                <h2>SignIn</h2>
                <form onSubmit={handleSignIn}>
                  <div className="formdiv">
                    <label>Email</label>
                    <input
                      required
                      type="email"
                      name="Email"
                      onFocus={Focus}
                      onBlur={Notfocus}
                      value={loginData.usermail}
                      onChange={(e) => setLoginData({ ...loginData, usermail: e.target.value })}
                    />
                  </div>
                  <div className="formdiv">
                    <label>Password</label>
                    <input
                      required
                      type="password"
                      name="password"
                      onFocus={Focus}
                      onBlur={Notfocus}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                  </div>
                  <button className='regbutton actionbutton'>Login</button>
                  <p>Don't have an account? <a onClick={MoveToSignUp}>SignUp</a></p>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {alertMsg && (
          <div className={`custom-alert ${alertType}`}>
            {alertMsg}
          </div>
        )}
      </div>
    </>
  );
}

export default LoginPage;
