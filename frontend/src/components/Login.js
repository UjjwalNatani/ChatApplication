import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken, setUsername }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [login, setLogin] = useState(true);
  const [signUp, setSignUp] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignUpError] = useState('');

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://chatapplication-backend-lbvd.onrender.com';

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/`, { username: usernameInput, password, rePassword, action });
      if (action === 'login') {
        setToken(res.data.token);
        const resolved = res.data.username || usernameInput;
        setUsername(resolved);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', resolved);
      } else {
        // On successful signup, switch to login view
        alert('User Created Successfully');
        setUsernameInput('');
        setPassword('');
        setRePassword('');
        setLoginError('');
        setSignUpError('');
        setSignUp(false);
        setLogin(true);
      }
    } catch (err) {
      if (action === 'login') {
        setLoginError(err.response?.data?.message || 'Login failed');
      } else {
        setSignUpError(err.response?.data?.message || 'Signup failed');
      };
    }
  };

  return (
    <div>
      {login &&
        <div className='main-div'>
          <div className='child-div'>
            <h2>Login</h2>
            {loginError && <p>{loginError}</p>}
            <form onSubmit={(e) => handleSubmit(e, 'login')}>
              <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" className='input-field' /> <br />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className='input-field' /><br />
              <button type="submit" className='submit-button'>Login</button>
            </form>
            <p>Don't have an account? <button onClick={() => { setLogin(false); setSignUp(true); setSignUpError(''); setUsernameInput(''); setPassword(''); }}>Sign Up</button></p>
          </div>
        </div>
      }
      {signUp &&
        <div className='main-div'>
          <div className='child-div' style={{height:'45vh'}}>
            <h1>Sign Up</h1>
            {signupError && <p>{signupError}</p>}
            <form onSubmit={(e) => handleSubmit(e, 'signup')}>
              <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" className='input-field'/> <br/>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className='input-field'/><br/>
              <input type="password" value={rePassword} onChange={(e) => setRePassword(e.target.value)} placeholder="Retype Password" className='input-field'/><br/>
              <button type="submit" className='submit-button'>SignUp</button>
            </form>
            <p>Already have an account? <button onClick={() => { setSignUp(false); setLogin(true); setLoginError(''); setUsernameInput(''); setPassword(''); setRePassword(''); }}>Login</button></p>
          </div>
        </div>
      }
    </div>
  );
};

export default Login;
