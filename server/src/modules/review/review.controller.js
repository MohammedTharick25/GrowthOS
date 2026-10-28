import {reviewService} from './review.service.js';
export async function saveWeekly(req,res,next){try{res.status(201).json({success:true,data:{review:await reviewService.saveWeekly(req.user,req.validated.body)}})}catch(e){next(e)}}
export async function currentWeekly(req,res,next){try{res.json({success:true,data:{review:await reviewService.currentWeekly(req.user)}})}catch(e){next(e)}}
export async function saveMonthly(req,res,next){try{res.status(201).json({success:true,data:{review:await reviewService.saveMonthly(req.user,req.validated.body)}})}catch(e){next(e)}}
export async function saveDaily(req,res,next){try{res.status(201).json({success:true,data:await reviewService.saveDaily(req.user,req.validated.body)})}catch(e){next(e)}}
export async function getDaily(req,res,next){try{res.json({success:true,data:{review:await reviewService.getDaily(req.user,req.validated.params.dateKey)}})}catch(e){next(e)}}
export async function history(req,res,next){try{const{from,to}=req.validated.query;res.json({success:true,data:{reviews:await reviewService.history(req.user,from,to)}})}catch(e){next(e)}}
