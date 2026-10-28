import { authService } from './auth.service.js';
import { clearAuthCookies, setAuthCookies } from '../../utils/generateToken.js';
const send = (res, result) => { setAuthCookies(res, result.accessToken, result.refreshToken); res.json({ success: true, data: { user: result.user } }); };
export async function signup(req, res, next) { try { res.status(201).json({ success: true, data: await authService.signup(req.validated.body) }); } catch (error) { next(error); } }
export async function login(req, res, next) { try { send(res, await authService.login(req.validated.body)); } catch (error) { next(error); } }
export async function resendVerification(req, res, next) { try { res.json({ success: true, data: await authService.resendVerification(req.validated.body.email) }); } catch (error) { next(error); } }
export async function verifyEmail(req, res, next) { try { res.json({ success: true, data: await authService.verifyEmail(req.validated.body.token) }); } catch (error) { next(error); } }
export async function requestPasswordReset(req, res, next) { try { res.json({ success: true, data: await authService.requestPasswordReset(req.validated.body.email) }); } catch (error) { next(error); } }
export async function resetPassword(req, res, next) { try { res.json({ success: true, data: await authService.resetPassword(req.validated.body.token, req.validated.body.password) }); } catch (error) { next(error); } }
export async function refresh(req, res, next) { try { send(res, await authService.refresh(req.cookies.refreshToken)); } catch (error) { clearAuthCookies(res); next(error); } }
export async function logout(req, res, next) { try { await authService.logout(req.cookies.refreshToken); clearAuthCookies(res); res.json({ success: true, message: 'You are signed out.' }); } catch (error) { next(error); } }
export async function me(req, res, next) { try { res.json({ success: true, data: { user: await authService.me(req.user.id) } }); } catch (error) { next(error); } }
