import mongoose from 'mongoose';
const schema = new mongoose.Schema({ key: { type: String, enum: ['career','health','confidence','finance','family','discipline'], unique: true }, name: String, icon: String, color: String, statement: String, habit: String, qualities: [String], guides: [String], order: Number }, { timestamps: true });
export const Identity = mongoose.model('Identity', schema);
