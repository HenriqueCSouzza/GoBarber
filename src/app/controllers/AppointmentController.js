import * as Yup from 'yup';
/* date-fns
 * startOfHour - pega o inicio da hora como 13:30:00 - ele irá pegar somente o 13 e zerará o resto
 * parseISO - transforma a data international 2000-12-30T13:30:00-03:00 string em um objeto
 * isBefore
 * subHours
 */
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
// tradução de data
import pt from 'date-fns/locale/pt';

import calReqPage from '../../util/utils';
import Users from '../models/User';
import Files from '../models/File';
import Appointments from '../models/Appointments';
import Notification from '../../schemas/Notification';
// envio de email
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page } = req.query;
    const reqPage = await calReqPage(page);
    const appointment = await Appointments.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      attributes: ['id', 'date', 'past', 'cancelable'],
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

    /**
     * Check user is a provider
     */
    const checkIsUserProvider = await Users.findOne({
      where: { id: req.userId, provider: false },
    });

    if (!checkIsUserProvider) {
      return res
        .status(401)
        .json({ error: 'Only can user create appointment ' });
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

    /**
     * notify appointment provider
     */
    const user = await Users.findByPk(req.userId);

    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento ${user.name} para ${formattedDate}`,
      user: provider_id,
    });
    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointments.findByPk(req.params.id, {
      include: [
        {
          model: Users,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: Users,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment",
      });
    }
    // remove duas horas do horario de agendamento
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'You can only cancel appointments 2 hours in advance' });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, { appointment });
    return res.json(appointment);
  }
}
export default new AppointmentController();
