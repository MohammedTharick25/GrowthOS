import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},habitId:{type:mongoose.Schema.Types.ObjectId,ref:'Habit',required:true},dateKey:{type:String,required:true},completedAt:{type:Date,default:Date.now},minutes:{type:Number,min:1,max:1440},note:{type:String,maxlength:500}},{timestamps:true});
schema.index({userId:1,habitId:1,dateKey:1},{unique:true});schema.index({userId:1,dateKey:1});
export const Checkin=mongoose.model('Checkin',schema);
