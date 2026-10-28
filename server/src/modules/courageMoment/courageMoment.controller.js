import{courageMomentService}from'./courageMoment.service.js';
export async function add(req,res,next){try{const result=await courageMomentService.add(req.user,req.validated.body);res.status(201).json({success:true,data:result})}catch(e){next(e)}}
export async function range(req,res,next){try{const{from,to}=req.validated.query;res.json({success:true,data:{moments:await courageMomentService.range(req.user,from,to)}})}catch(e){next(e)}}
