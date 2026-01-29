const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userModel = new schema({
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tasks',
    },
  ],
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    max: 16,
    min: 8,
    validate: {
      validator: function (val) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          val,
        );
      },
      message:
        'Password must have at least one uppercase, one lowecase and a special character',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Users = mongoose.model('Users', userModel);

module.exports = {
  Users,
};
