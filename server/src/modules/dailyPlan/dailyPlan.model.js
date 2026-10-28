import mongoose from 'mongoose';
const priority = new mongoose.Schema({ identityKey: { type:String, enum:['career','health','confidence','finance','family','discipline'], required:true }, text:{type:String,default:'',maxlength:240}, done:{type:Boolean,default:false}, doneAt:Date }, {_id:false});
const intent = new mongoose.Schema({ if:{type:String,required:true,maxlength:180}, then:{type:String,required:true,maxlength:240} },{_id:false});
const schema = new mongoose.Schema({ userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, dateKey:{type:String,required:true}, priorities:{type:[priority],default:[]}, qualitiesToday:{type:[String],default:[]}, ifThen:{type:[intent],default:[]}, morningDoneAt:Date },{timestamps:true});
schema.index({userId:1,dateKey:1},{unique:true});
export const DailyPlan = mongoose.model('DailyPlan',schema);
