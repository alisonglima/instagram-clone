const Post = require('../models/Post');

module.exports = {
  async index(req, res) {
    const posts = await Post.find().sort('-createdAt');

    return res.json(posts);
  },

  async store(req, res) {
    const {
      author, place, description, hashtags,
    } = req.body;
    const { Key: image, Location: url } = req.file;

    const post = await Post.create({
      author,
      place,
      description,
      hashtags,
      image,
      url,
    });

    req.io.emit('post', post);

    return res.json(post);
  },
};
