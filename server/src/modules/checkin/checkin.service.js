import {checkinRepository} from './checkin.repository.js';
import {habitRepository} from '../habit/habit.repository.js';
import {dateKeyAt,shiftDateKey} from '../../utils/dateHelpers.js';
import {AppError} from '../../utils/errorHandler.js';
import {awardXp} from '../gamification/gamification.service.js';
import {streakService} from '../streak/streak.service.js';
export const checkinService={
  today:(user)=>checkinRepository.today(user.id,dateKeyAt(new Date(),user.timezone)),
  async toggle(user,input){
    const habit=await habitRepository.find(user.id,input.habitId);if(!habit)throw new AppError('Habit not found.',404);
    const key=dateKeyAt(new Date(),user.timezone);const existing=await checkinRepository.find(user.id,habit.id,key);
    if(existing){await checkinRepository.remove(user.id,habit.id,key);return {completed:false,checkin:null,xpDelta:0};}
    let checkin;
    try{checkin=await checkinRepository.create({userId:user.id,habitId:habit.id,dateKey:key,minutes:input.minutes,note:input.note});}
    catch(error){if(error.code===11000){return {completed:true,checkin:await checkinRepository.find(user.id,habit.id,key),xpDelta:0};}throw error;}
    const reward=await awardXp({userId:user.id,type:'habit',points:5,refId:`${habit.id}:${key}`,dateKey:key});
    const streak=await streakService.recompute(user);
    return {completed:true,checkin,xpDelta:reward.xpDelta,badgesAwarded:reward.badgesAwarded,streak};
  },
  async setCompleted(user,{habitId,dateKey,completed}){
    const today=dateKeyAt(new Date(),user.timezone);if(dateKey!==today&&dateKey!==shiftDateKey(today,-1))throw new AppError('Offline check-ins can sync for today or yesterday only.',422);
    const habit=await habitRepository.find(user.id,habitId);if(!habit)throw new AppError('Habit not found.',404);
    const existing=await checkinRepository.find(user.id,habit.id,dateKey);
    if(!completed){if(existing)await checkinRepository.remove(user.id,habit.id,dateKey);const streak=existing?await streakService.recompute(user):undefined;return{completed:false,checkin:null,xpDelta:0,streak};}
    if(existing)return{completed:true,checkin:existing,xpDelta:0};
    let checkin;try{checkin=await checkinRepository.create({userId:user.id,habitId:habit.id,dateKey});}catch(error){if(error.code===11000)return{completed:true,checkin:await checkinRepository.find(user.id,habit.id,dateKey),xpDelta:0};throw error;}
    const reward=await awardXp({userId:user.id,type:'habit',points:5,refId:`${habit.id}:${dateKey}`,dateKey});
    const streak=await streakService.recompute(user);return{completed:true,checkin,xpDelta:reward.xpDelta,badgesAwarded:reward.badgesAwarded,streak};
  },
  range:(user,from,to)=>checkinRepository.range(user.id,from,to),
};
