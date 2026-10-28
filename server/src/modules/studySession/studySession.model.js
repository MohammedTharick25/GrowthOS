import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},dateKey:{type:String,required:true},minutes:{type:Number,required:true,min:1,max:1440},topic:{type:String,default:'',maxlength:160},learned:{type:String,default:'',maxlength:1000},explainedAloud:{type:Boolean,default:false},projectId:String,isDeleted:{type:Boolean,default:false},deletedAt:Date},{timestamps:true});
schema.index({userId:1,dateKey:1});
export const StudySession=mongoose.model('StudySession',schema);
