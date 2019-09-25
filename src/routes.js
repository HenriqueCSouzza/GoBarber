import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FIleController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';
// Middleware de autenticação do token
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// A middleware só vai funcionar com as routas apartir daqui
routes.use(authMiddleware);

routes.get('/users', UserController.index);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.post('/file', upload.single('file'), FileController.store);

routes.get('/appointment', AppointmentController.index);

routes.get('/schedule', ScheduleController.index);

routes.post('/appointment', AppointmentController.store);
routes.delete('/appointment/:id', AppointmentController.delete);

routes.get('/notifications', NotificationController.index);

routes.put('/notifications/:id', NotificationController.update);

export default routes;
