const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const JWT_SECRET = 'itispersonal';

router.use(bodyParser.json());
router.use(cors());

router.post('/', async (req, res) => {
  const { username, password, rePassword, action } = req.body;
  if (action === 'login') {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid User' });
      }

      if (password !== user.password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      console.log('New client connected');
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  } else if (action === 'signup') {
    try {
      if(!username || !password || !rePassword){
        return res.status(400).json({ message: 'Please Fill All Fields' });
      }

      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      if (password !== rePassword) {
        return res.status(400).json({ message: 'Password Do Not Match' });
      }

      user = new User({ username, password });
      await user.save();

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  } else if(action === 'logout'){
    console.log("Client disconnected");
    return res.status(400).json({ message: 'Logout Successfully' });
  } else {
    res.status(400).json({ message: 'Invalid action' });
  }
});

module.exports = router;