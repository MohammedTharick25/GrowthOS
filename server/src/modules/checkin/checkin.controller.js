import {checkinService} from './checkin.service.js';
export async function getToday(req,res,next){try{res.json({success:true,data:{checkins:await checkinService.today(req.user)}})}catch(e){next(e)}}
export async function toggle(req,res,next){try{res.json({success:true,data:await checkinService.toggle(req.user,req.validated.body)})}catch(e){next(e)}}
export async function setCompleted(req,res,next){try{res.json({success:true,data:await checkinService.setCompleted(req.user,req.validated.body)})}catch(e){next(e)}}
export async function getRange(req,res,next){try{const{from,to}=req.validated.query;res.json({success:true,data:{checkins:await checkinService.range(req.user,from,to)}})}catch(e){next(e)}}
