import {Review} from './review.model.js';
export const reviewRepository={
  saveDaily:(userId,dateKey,input)=>Review.findOneAndUpdate({userId,type:'daily',dateKey},{$set:{...input,userId,type:'daily',dateKey}},{new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true}),
  daily:(userId,dateKey)=>Review.findOne({userId,type:'daily',dateKey}).lean(),
  saveWeekly:(userId,weekKey,input)=>Review.findOneAndUpdate({userId,type:'weekly',dateKey:weekKey},{$set:{weekly:input.weekly,userId,type:'weekly',dateKey:weekKey,weekKey}},{new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true}),
  saveMonthly:(userId,dateKey,input)=>Review.findOneAndUpdate({userId,type:'monthly',dateKey},{$set:{monthly:input.monthly,userId,type:'monthly',dateKey}},{new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true}),
  weekly:(userId,weekKey)=>Review.findOne({userId,type:'weekly',dateKey:weekKey}).lean(),
  weeklyCount:(userId)=>Review.countDocuments({userId,type:'weekly'}),
  history:(userId,from,to)=>Review.find({userId,type:'daily',dateKey:{$gte:from,$lte:to}}).sort({dateKey:-1}).lean(),
};
