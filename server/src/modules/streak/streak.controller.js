import { streakService } from './streak.service.js';
export async function getStreak(req,res,next){try{res.json({success:true,data:{streak:await streakService.get(req.user)}})}catch(e){next(e)}}
export async function useRecovery(req,res,next){try{res.json({success:true,data:{streak:await streakService.useRecovery(req.user)}})}catch(e){next(e)}}
