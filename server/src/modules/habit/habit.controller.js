import { habitService } from './habit.service.js';
export async function getAll(req,res,next) { try { res.json({success:true,data:{habits:await habitService.all(req.user)}}); } catch(e){next(e);} }
export async function add(req,res,next) { try { res.status(201).json({success:true,data:{habit:await habitService.add(req.user.id,req.validated.body)}}); } catch(e){next(e);} }
export async function update(req,res,next) { try { res.json({success:true,data:{habit:await habitService.update(req.user.id,req.validated.params.id,req.validated.body)}}); } catch(e){next(e);} }
export async function archive(req,res,next) { try { await habitService.archive(req.user.id,req.params.id); res.json({success:true,message:'Habit archived.'}); } catch(e){next(e);} }
