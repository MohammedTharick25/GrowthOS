import mongoose from 'mongoose';
const historyRow=new mongoose.Schema({dateKey:{type:String,required:true},status:{type:String,enum:['active','recovery','missed','pending'],required:true},prioritiesDone:{type:Number,default:0}},{_id:false});
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,unique:true},current:{type:Number,default:0},best:{type:Number,default:0},lastActiveDateKey:String,lastRecomputedDateKey:String,recoveryDays:{type:[String],default:[]},recoveryUsedWeeks:{type:[String],default:[]},history:{type:[historyRow],default:[]}},{timestamps:true});
export const StreakState=mongoose.model('StreakState',schema);
