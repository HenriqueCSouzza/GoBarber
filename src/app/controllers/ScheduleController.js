import { startOfDay, endOfDay, parseISO } from 'date-fns';
// operadores que auxiliam a usar beetween e outros no where
import { Op } from 'sequelize';
import Appointments from '../models/Appointments';
import Users from '../models/User';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await Users.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });
    if (!checkUserProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    const { date } = req.query;
    const parseDate = parseISO(date);
    const appointments = await Appointments.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
        },
      },
      order: ['date'],
    });
    return res.json(appointments);
  }
}

export default new ScheduleController();
