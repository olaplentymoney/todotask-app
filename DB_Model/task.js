const mongoose = require('mongoose');

const schema = mongoose.Schema;

const taskModel = new schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: {
      values: ['in-progress', 'completed', 'pending'],
      message: '{VALUE} is not a valid state',
    },
    default: 'pending',
    // validate: {
    //   validator: (val) => {
    //     return ['in-progress', 'completed', 'pending'].some((v) => v === val);
    //   },
    // },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const Tasks = mongoose.model('Tasks', taskModel);

module.exports = {
  Tasks,
};
