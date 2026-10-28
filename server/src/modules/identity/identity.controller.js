import { identityService } from './identity.service.js';
export async function getAll(req,res,next) { try { res.json({success:true,data:{identities:await identityService.all(req.user)}}); } catch(e){next(e);} }
export async function getOne(req,res,next) { try { res.json({success:true,data:{identity:await identityService.get(req.params.key,req.user)}}); } catch(e){next(e);} }
export async function saveStatement(req,res,next) { try { const {key}=req.validated.params; const {statement}=req.validated.body; res.json({success:true,data:{identity:await identityService.saveStatement(key,statement,req.user.id)}}); } catch(e){next(e);} }
