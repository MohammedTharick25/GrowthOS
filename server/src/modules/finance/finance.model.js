import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},dateKey:{type:String,required:true},type:{type:String,enum:['income','essential','optional','saved'],required:true},amount:{type:Number,required:true,min:0.01},category:{type:String,default:'General',trim:true,maxlength:80},note:{type:String,default:'',trim:true,maxlength:500},isDeleted:{type:Boolean,default:false},deletedAt:Date},{timestamps:true});
schema.index({userId:1,dateKey:1,isDeleted:1});
export const FinanceEntry=mongoose.model('FinanceEntry',schema);
