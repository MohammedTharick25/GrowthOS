import{analyticsService}from'./analytics.service.js';
export async function trends(req,res,next){try{res.json({success:true,data:{trends:await analyticsService.trends(req.user,req.validated.query.range)}})}catch(e){next(e)}}
export async function heatmap(req,res,next){try{res.json({success:true,data:{heatmap:await analyticsService.heatmap(req.user,req.validated.query.year)}})}catch(e){next(e)}}
export async function radar(req,res,next){try{res.json({success:true,data:{radar:await analyticsService.radar(req.user,req.validated.query.week)}})}catch(e){next(e)}}
export async function study(req,res,next){try{res.json({success:true,data:{study:await analyticsService.study(req.user,req.validated.query.range)}})}catch(e){next(e)}}
export async function mood(req,res,next){try{res.json({success:true,data:{mood:await analyticsService.mood(req.user,req.validated.query.range)}})}catch(e){next(e)}}
export async function insights(req,res,next){try{res.json({success:true,data:{insights:await analyticsService.insights(req.user)}})}catch(e){next(e)}}
