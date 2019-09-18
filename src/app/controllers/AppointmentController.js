import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import calReqPage from '../../util/utils';
/* date-fns
 * startOfHour - pega o inicio da hora como 13:30:00 - ele irá pegar somente o 13 e zerará o resto
 * parseISO
 * isBefore
 */
import Users from '../models/User';
import Files from '../models/File';
import Appointments from '../models/Appointments';

class AppointmentController {
  async index(req, res) {
    const { page } = req.query;
    const reqPage = await calReqPage(page);
    const appointment = await Appointments.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      attributes: ['id', 'date'],
      limit: 20,
      // pulando 20 registros
      offset: (reqPage - 1) * 20,
      order: ['date'],
      // relacionamentos
      include: [
        {
          model: Users,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: Files,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointment);
  }

  async store(req, res) {
    const schema = Yup.object({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { provider_id, date } = req.body;
    /*
     * Check if provider_id is a provider
     */
    const checkIsProvider = await Users.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointment with provider' });
    }
    /*
     * Check for past date
     */
    const hourStart = startOfHour(parseISO(date));
    // se a hourStart
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }
    /*
     * Check date availability
     */

    const checkAvailability = await Appointments.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }
    const appointment = await Appointments.create({
      user_id: req.userId,
      provider_id,
      date,
    });
    return res.json(appointment);
  }
}
export default new AppointmentController();
