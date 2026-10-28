import { dailyPlanService } from './dailyPlan.service.js';
export async function getToday(req,res,next){try{res.json({success:true,data:{plan:await dailyPlanService.today(req.user)}})}catch(e){next(e)}}
export async function saveToday(req,res,next){try{res.json({success:true,data:{plan:await dailyPlanService.save(req.user,req.validated.body)}})}catch(e){next(e)}}
export async function togglePriority(req,res,next){try{const result=await dailyPlanService.toggle(req.user,req.validated.params.index);res.json({success:true,data:result})}catch(e){next(e)}}
export async function getRange(req,res,next){try{const {from,to}=req.validated.query;res.json({success:true,data:{plans:await dailyPlanService.range(req.user,from,to)}})}catch(e){next(e)}}
