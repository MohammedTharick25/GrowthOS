import { dailyPlanRepository } from './dailyPlan.repository.js';
import { dateKeyAt } from '../../utils/dateHelpers.js';
import { AppError } from '../../utils/errorHandler.js';
import { awardXp } from '../gamification/gamification.service.js';
import { streakService } from '../streak/streak.service.js';
const defaultPriorities = ['career','health','confidence'].map((identityKey)=>({identityKey,text:'',done:false}));
const defaultIfThen = [{if:'I feel unmotivated',then:'I will start with one small task.'},{if:'I make a mistake',then:'I will understand it without insulting myself.'},{if:'I am afraid to express myself',then:'I will take one manageable step.'},{if:'I miss a commitment',then:'I will adjust the plan and begin again.'}];
export const dailyPlanService = {
  async today(user) { const key=dateKeyAt(new Date(),user.timezone); let plan=await dailyPlanRepository.get(user.id,key); if(!plan) { try { plan=await dailyPlanRepository.save(user.id,key,{priorities:defaultPriorities,ifThen:defaultIfThen}); } catch(error) { if(error.code!==11000) throw error; plan=await dailyPlanRepository.get(user.id,key); } } return plan; },
  async save(user,input) {
    const key=dateKeyAt(new Date(),user.timezone); const before=await dailyPlanRepository.get(user.id,key);
    const updates={...input}; if(input.priorities) updates.priorities=input.priorities.map((p,index)=>({...p,doneAt:p.done?(before?.priorities[index]?.doneAt || new Date()):undefined}));
    const plan=await dailyPlanRepository.save(user.id,key,updates);
    for(const [index,priority] of (plan.priorities || []).entries()) if(priority.done && !before?.priorities[index]?.done) await awardXp({userId:user.id,type:'priority',points:10,refId:`${key}:${index}`,dateKey:key});
    if(plan.priorities?.some((priority,index)=>priority.done&&!before?.priorities[index]?.done)) await streakService.recordPriorityCompletion(user,key);
    else await streakService.recompute(user);
    return plan;
  },
  async toggle(user,index) {
    const plan=await this.today(user); if(!plan.priorities[index]) throw new AppError('Priority not found.',404);
    const done=!plan.priorities[index].done; plan.priorities[index].done=done; plan.priorities[index].doneAt=done?new Date():undefined; await plan.save();
    const key=dateKeyAt(new Date(),user.timezone);
    let reward={xpDelta:0,badgesAwarded:[]}; let streak;
    if(done) { reward=await awardXp({userId:user.id,type:'priority',points:10,refId:`${key}:${index}`,dateKey:key}); streak=await streakService.recordPriorityCompletion(user,key); }
    else streak=await streakService.recompute(user);
    return {plan,xpDelta:reward.xpDelta,badgesAwarded:[...reward.badgesAwarded,...(streak.badgesAwarded||[])],streak};
  },
  range: (user,from,to) => dailyPlanRepository.range(user.id,from,to),
};
