import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema({
  text: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Data || mongoose.model('Data', DataSchema);
