import Sequelize, { Model } from 'sequelize';

class Appointments extends Model {
  static init(sequelize) {
    // instancia do pai o init
    super.init(
      {
        // atribui os campos da tabela,somente os que o usuario irá interagir
        date: Sequelize.DATE,
        cancelet_at: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
    // quando tem dois relacionamentos em uma tabela é preciso utilizar apelidos
    // usando ( as:'apelido' )
    this.belongsTo(models.Users, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointments;
