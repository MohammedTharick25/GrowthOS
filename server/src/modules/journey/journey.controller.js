import{journeyService}from'./journey.service.js';
export async function current(req,res,next){try{res.json({success:true,data:{journey:await journeyService.current(req.user)}})}catch(e){next(e)}}
export async function start(req,res,next){try{res.status(201).json({success:true,data:{journey:await journeyService.start(req.user)}})}catch(e){next(e)}}
export async function advance(req,res,next){try{res.json({success:true,data:{journey:await journeyService.advance(req.user)}})}catch(e){next(e)}}
export async function restart(req,res,next){try{res.json({success:true,data:{journey:await journeyService.start(req.user,true)}})}catch(e){next(e)}}
