import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      // pode ser usado campos dos tipos primitivos String,Number, Array
      type: String,
      required: true,
    },
    user: {
      type: Number,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);
