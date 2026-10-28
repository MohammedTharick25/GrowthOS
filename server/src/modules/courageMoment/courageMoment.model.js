import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},dateKey:{type:String,required:true},text:{type:String,required:true,trim:true,maxlength:500},kind:{type:String,enum:['courage','assertive','boundary','win'],default:'courage'},isDeleted:{type:Boolean,default:false},deletedAt:Date},{timestamps:true});
schema.index({userId:1,dateKey:1});
export const CourageMoment=mongoose.model('CourageMoment',schema);
