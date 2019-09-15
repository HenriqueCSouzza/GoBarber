import Users from '../models/User';
import Files from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await Users.findAll({
      // condição para filtro
      where: { provider: true },
      // escolhe os dados que serão retornados
      attributes: ['id', 'name', 'email', 'avatar_id'],
      // inclui o relacionamento LEFT,INNER,OUTER,JOIN
      include: [
        {
          model: Files,
          as: 'avatar',
          attribute: ['name', 'path'],
        },
      ],
    });
    return res.json(providers);
  }
}

export default new ProviderController();
