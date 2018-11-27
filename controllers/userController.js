const cloudinary = require('cloudinary');

const { storage } = require('../fileMiddleware');
const { User } = require( '../models/user');

module.exports = {

  getUser: async(req, res) => {
    try {
      const user = await User.findOne({ _id: req.user.id });

      return res.status(200).json(user.serializeDetails());
    } catch (error) {
      res.status(500).json(error);
    }
  },

  registerUser: async(req, res) => {
    const { username, password, firstName, lastName } = req.body;

    let user = await User.findOne({ username });
    
    try {
      if (user) throw 'User already registered with this username';

      user = await User.create({
        username,
        password,
        firstName,
        lastName
      });
      await user.save();

      return res.status(201).json(user.serialize())
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  registerUserDetails: async(req, res) => { 
    try {
      const user = await User.findOne({ _id: req.user.id });

      Object.keys(req.body).forEach(key => {
        user[key] = req.body[key];
      });
      user.profilePic.url = req.file ? req.file.url : '';
      user.profilePic.id = req.file ? req.file.public_id.split('/')[1] : '';
    

      await user.save();
      return res.status(200).json(user.serializeDetails())
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateScore: async(req, res) => {
    try {
      const user = await User.findOne({ _id: req.user.id });

      user.score = user.score + 1;
      await user.save();

      return res.status(200).json('score updated');
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  sendFriendRequest: async(req, res) => {
    const{ userId } = req.body;

    try {
      const user = await User.findOne({ _id: req.user.id });
      const otherUser = await User.findOne({ _id: userId });

      user.friends.friendRequested.push(userId);
      otherUser.friends.friendRequests.push(req.user.id);
      await user.save();
      await otherUser.save();

      return res.status(200).json('friend request sent');
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  acceptFriendRequest: async(req, res) => {
    const{ userId } = req.body;

    try {
      const user = await User.findOne({ _id: req.user.id });
      const otherUser = await User.findOne({ _id: userId });

      user.friends.list.push(userId);
      user.friends.friendRequests = user.friends.friendRequests.filter(val => val._id !== userId); //FIX NEED TO USE ACTUAL MONGOOSE FUNCTIONS
      otherUser.friends.list.push(req.user.id);
      otherUser.friends.friendRequested = user.friends.friendRequested.filter(val => val._id !== req.user.id); //FIX NEED TO USE ACTUAL MONGOOSE FUNCTIONS
      await user.save();
      await otherUser.save();

      return res.status(200).json('friend request accepted');
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  rejectFriendRequest: async(req, res) => {
    const{ userId } = req.body;

    try {
      const user = await User.findOne({ _id: req.user.id });
      const otherUser = await User.findOne({ _id: userId });

      user.friends.friendRequests = user.friends.friendRequests.filter(val => val._id !== userId);
      otherUser.friends.friendRequested = user.friends.friendRequested.filter(val => val._id !== req.user.id); 

      await user.save();
      await otherUser.save();

      return res.status(200).json('friend request rejected');
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  removeFriend: async(req, res) => {
    const { userId } = req.body;

    try {
      const user = await User.findOne({ _id: req.user.id });
      const otherUser = await User.findOne({ _id: userId });

      user.friends.list = user.friends.list.filter(val => val._id !== userId);
      otherUser.friends.list = otherUser.friends.list.filter(val => val._id !== userId);
      
      await user.save();
      await otherUser.save();

      return res.status(200).json('friend removed from friends list');
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  //reset base challenge data
}