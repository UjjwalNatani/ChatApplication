import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);
  
  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }, [username]);
  
  return (
    <div>
      {!token ? <Login setToken={setToken} setUsername={setUsername} /> : <Chat token={token} username={username} />}
    </div>
  );
};

export default App;