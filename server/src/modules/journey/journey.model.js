import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,unique:true},startDate:{type:String,required:true},currentDay:{type:Number,default:1,min:1,max:30},phase:{type:String,enum:['awareness','consistency','confidence','integration'],default:'awareness'},status:{type:String,enum:['active','completed'],default:'active'},cycleNumber:{type:Number,default:1},completedDays:{type:[Number],default:[]},completedPhases:{type:[String],default:[]}},{timestamps:true});
export const Journey=mongoose.model('Journey',schema);
