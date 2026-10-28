import {StreakState} from './streak.model.js';
import {DailyPlan} from '../dailyPlan/dailyPlan.model.js';
import {Checkin} from '../checkin/checkin.model.js';
export const streakRepository={
  state:(userId)=>StreakState.findOne({userId}),
  save:(userId,updates)=>StreakState.findOneAndUpdate({userId},{$set:updates,$setOnInsert:{userId}},{new:true,upsert:true,setDefaultsOnInsert:true}),
  plans:(userId,from,to)=>DailyPlan.find({userId,dateKey:{$gte:from,$lte:to}}).select('dateKey priorities').lean(),
  habitCheckins:(userId,from,to)=>Checkin.find({userId,dateKey:{$gte:from,$lte:to}}).select('habitId dateKey').lean(),
};
