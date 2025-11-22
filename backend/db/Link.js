const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");

// Rule: Codes follow [A-Za-z0-9]{6,8}.
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const LinkSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  targetUrl: {
    type: String,
    required: true,
  },
  totalClicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastClickedTime: {
    type: Date,
    default: null,
  },
});

/**
 * Generates a unique short code for a new link.
 * @returns {string} A unique 6-8 character code.
 */
LinkSchema.statics.generateUniqueCode = async function () {
  let code;
  let exists = true;
  while (exists) {
    // Generate a code between 6 and 8 characters long randomly
    const length = Math.floor(Math.random() * 3) + 6;
    code = customAlphabet(alphabet, length)();
    const count = await this.countDocuments({ code });
    exists = count > 0;
  }
  return code;
};

/**
 * Increments the click count and updates the last clicked time.
 * @param {string} code The short code.
 * @returns {object | null} The updated link object or null.
 */
LinkSchema.statics.incrementClicks = async function (code) {
  const now = new Date();
  // Find the link by code and atomically update two fields
  const link = await this.findOneAndUpdate(
    { code },
    {
      $inc: { totalClicks: 1 },
      lastClickedTime: now,
    },
    { new: true } // Return the updated document
  );
  return link;
};

const Link = mongoose.model("Link", LinkSchema);
module.exports = Link;
