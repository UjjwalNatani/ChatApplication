// frontend/src/components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const socket = io('https://chatapplication-backend-lbvd.onrender.com'); // Backend URL

const Chat = ({ token, initialUsername }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState(initialUsername);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get('https://chatapplication-backend-lbvd.onrender.com/api/messages', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => socket.off('message');
  }, [token]);

  useEffect(() => {
    // Set username from local storage if not set
    if (!username) {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, [username]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const newMessage = { username: username, message: input };
    socket.emit('message', newMessage);
    setInput('');
  };

  const handleLogout = async (action) => {
    try {
      await axios.post('https://chatapplication-backend-lbvd.onrender.com/', { action });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('token'); // Clear token from local storage
      localStorage.removeItem('username'); // Clear username from local storage
      window.location.reload(); // Refresh the page to redirect to login
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await axios.put(`https://chatapplication-backend-lbvd.onrender.com/api/messages/${id}`, { message: editingContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingMessageId(null);
      setEditingContent('');
      const updatedMessage = res.data;
      const updatedMessages = messages.map((msg) =>
        msg._id === id ? updatedMessage : msg
      );
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://chatapplication-backend-lbvd.onrender.com/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className='chat-main-div'>
      <div className='chat-heading'>
        <p className='chat-title'>Chat Room</p>
        <button onClick={() => handleLogout("logout")} className="logout-button">Logout</button>
      </div>
      <div className='chat-content'>
        <div className='chat-messages'>
          {messages.map((msg) => (
            <div key={msg._id} className="message">
              <div className="message-content">
                <strong>{msg.username}</strong>: {msg.message}
              </div>
              <div className="message-meta">
                {format(new Date(msg.timestamp), 'p, MMMM dd yyyy')}
                {msg.edited && <span> (Edited)</span>}
                {msg.username === username && (
                  <span className="message-actions">
                    {editingMessageId === msg._id ? (
                      <>
                        <input
                          type="text"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          placeholder="Edit your message"
                        />
                        <IconButton
                          color="primary"
                          aria-label="save"
                          size="small"
                          style={{ fontSize: '0.7rem', padding: '4px' }}
                          onClick={() => handleEdit(msg._id)}
                        >
                          <SaveIcon style={{ fontSize: 'inherit' }}/>
                        </IconButton>

                        <IconButton
                          color="primary"
                          aria-label="cancel"
                          size="small"
                          style={{ fontSize: '0.7rem', padding: '4px' }}
                          onClick={() => setEditingMessageId(null)}
                        >
                          <CancelIcon style={{ fontSize: 'inherit' }}/>
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          color="primary"
                          aria-label="edit"
                          size="small"
                          style={{ fontSize: '0.7rem', padding: '4px' }}
                          onClick={() => {
                            setEditingMessageId(msg._id);
                            setEditingContent(msg.message);
                          }}
                        >
                          <EditIcon style={{ fontSize: 'inherit' }}/>
                        </IconButton>

                        <IconButton
                          color="primary"
                          aria-label="delete"
                          size="small"
                          style={{ fontSize: '0.7rem', padding: '4px' }}
                          onClick={() => handleDelete(msg._id)}
                        >
                          <DeleteIcon style={{ fontSize: 'inherit' }}/>
                        </IconButton>
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className='chat-send-button'>
          <form onSubmit={sendMessage} className="send-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter message"
              style={{ width: '80%', height: '5vh' }}
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
