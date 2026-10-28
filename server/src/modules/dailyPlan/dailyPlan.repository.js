import { DailyPlan } from './dailyPlan.model.js';
export const dailyPlanRepository = {
  get: (userId,dateKey) => DailyPlan.findOne({userId,dateKey}),
  save: (userId,dateKey,updates) => DailyPlan.findOneAndUpdate({userId,dateKey},{$set:updates,$setOnInsert:{userId,dateKey}},{new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true}),
  range: (userId,from,to) => DailyPlan.find({userId,dateKey:{$gte:from,$lte:to}}).sort({dateKey:1}).lean(),
};
