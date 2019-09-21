import Notification from '../../schemas/Notification';
import Users from '../models/User';

class NotificationController {
  async index(req, res) {
    /*
     * Check if provider_id is a provider
     */
    const checkIsProvider = await Users.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Only provider can load notifications' });
    }
    // find() serve para listar todos os dados
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      // campos que serão atualizados
      { read: true },
      // retorna com a nova atualização
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
