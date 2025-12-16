const mongoose = require("mongoose");

const userWorkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  tasks: [
    {
      title: {
        type: String,
        required: true
      },
      isCompleted: {
        type: Boolean,
        default: false
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("UserWork", userWorkSchema);