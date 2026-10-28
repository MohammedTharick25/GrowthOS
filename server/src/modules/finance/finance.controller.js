import{financeService}from'./finance.service.js';import{dateKeyAt,shiftDateKey}from'../../utils/dateHelpers.js';
export async function add(req,res,next){try{res.status(201).json({success:true,data:{entry:await financeService.add(req.user,req.validated.body)}})}catch(e){next(e)}}
export async function range(req,res,next){try{const{from,to}=req.validated.query;res.json({success:true,data:{entries:await financeService.range(req.user,from,to)}})}catch(e){next(e)}}
export async function summary(req,res,next){try{const today=dateKeyAt(new Date(),req.user.timezone);const to=req.validated.query.to||today;const from=req.validated.query.from||shiftDateKey(to,-29);res.json({success:true,data:{summary:await financeService.summary(req.user,from,to)}})}catch(e){next(e)}}
export async function update(req,res,next){try{res.json({success:true,data:{entry:await financeService.update(req.user.id,req.validated.params.id,req.validated.body)}})}catch(e){next(e)}}
export async function remove(req,res,next){try{await financeService.remove(req.user.id,req.params.id);res.json({success:true,message:'Entry removed.'})}catch(e){next(e)}}
