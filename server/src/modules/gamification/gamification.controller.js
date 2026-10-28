import { gamificationService } from './gamification.service.js';
export async function getProfile(req,res,next){try{res.json({success:true,data:await gamificationService.profile(req.user.id)})}catch(e){next(e)}}
export async function getBadges(req,res,next){try{res.json({success:true,data:{badges:await gamificationService.badges(req.user.id)}})}catch(e){next(e)}}
