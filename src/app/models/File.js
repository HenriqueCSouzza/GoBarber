import Sequelize, { Model } from 'sequelize';

class Files extends Model {
  static init(sequelize) {
    // instancia do pai o init
    super.init(
      {
        // atribui os campos da tabela,somente os que o usuario irá interagir
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Files;
