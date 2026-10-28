import{studySessionService}from'./studySession.service.js';
export async function add(req,res,next){try{res.status(201).json({success:true,data:{session:await studySessionService.add(req.user,req.validated.body)}})}catch(e){next(e)}}
export async function range(req,res,next){try{const{from,to}=req.validated.query;res.json({success:true,data:{sessions:await studySessionService.range(req.user,from,to)}})}catch(e){next(e)}}
export async function remove(req,res,next){try{await studySessionService.remove(req.user,req.params.id);res.json({success:true,message:'Study session removed.'})}catch(e){next(e)}}
