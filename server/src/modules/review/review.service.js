import {reviewRepository} from './review.repository.js';
import {dateKeyAt} from '../../utils/dateHelpers.js';
import {AppError} from '../../utils/errorHandler.js';
import {weekKeyAt} from '../../utils/dateHelpers.js';
import {awardXp,awardBadge} from '../gamification/gamification.service.js';
import {dailyPlanRepository} from '../dailyPlan/dailyPlan.repository.js';
export const reviewService={
  async saveDaily(user,input){const key=dateKeyAt(new Date(),user.timezone);const review=await reviewRepository.saveDaily(user.id,key,input);const reward=await awardXp({userId:user.id,type:'dailyReview',points:15,refId:key,dateKey:key});const plan=await dailyPlanRepository.get(user.id,key);const perfect=plan?.priorities?.length===3&&plan.priorities.every((priority)=>priority.done)?await awardBadge(user.id,'first-perfect',{dateKey:key}):null;return {review,xpDelta:reward.xpDelta,badgesAwarded:[...reward.badgesAwarded,...(perfect?[perfect]:[])]};},
  getDaily:(user,key)=>reviewRepository.daily(user.id,key).then((row)=>{if(!row)throw new AppError('Reflection not found.',404);return row;}),
  async saveWeekly(user,input){const week=weekKeyAt(new Date(),user.timezone);const review=await reviewRepository.saveWeekly(user.id,week,input);await awardXp({userId:user.id,type:'weeklyReview',points:30,refId:week,dateKey:dateKeyAt(new Date(),user.timezone)});if(await reviewRepository.weeklyCount(user.id)>=4)await awardBadge(user.id,'weekly-4');return review;},
  saveMonthly:(user,input)=>reviewRepository.saveMonthly(user.id,dateKeyAt(new Date(),user.timezone),input),
  currentWeekly:(user)=>reviewRepository.weekly(user.id,weekKeyAt(new Date(),user.timezone)),
  history:(user,from,to)=>reviewRepository.history(user.id,from,to),
};
