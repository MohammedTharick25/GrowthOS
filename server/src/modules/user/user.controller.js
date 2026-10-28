import { userService } from './user.service.js';
import { userDataService } from './data.service.js';
import { clearAuthCookies } from '../../utils/generateToken.js';
const run = (action) => async (req, res, next) => { try { res.json({ success: true, data: { user: await action(req) } }); } catch (error) { next(error); } };
export const getProfile = run((req) => userService.profile(req.user.id));
export const updateProfile = run((req) => userService.update(req.user.id, req.validated.body));
export const updateSettings = run((req) => userService.update(req.user.id, req.validated.body));
export const updateTheme = run((req) => userService.update(req.user.id, req.validated.body));
export const completeOnboarding = run((req) => userService.completeOnboarding(req.user.id, req.validated.body));
export async function exportAccountData(req, res, next) {
  try {
    const payload = await userDataService.export(req.user.id);
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="growthos-data-${day}.json"`);
    res.json(payload);
  } catch (error) { next(error); }
}
export async function deleteAccount(req, res, next) {
  try {
    await userDataService.deleteAccount(req.user.id, req.validated.body.password);
    clearAuthCookies(res);
    res.json({ success: true, message: 'Your account and personal data have been deleted.' });
  } catch (error) { next(error); }
}
