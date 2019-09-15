module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Files', {
      // criando os campos da tabela
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  // utilizado para quando for dar rollback
  down: queryInterface => {
    return queryInterface.dropTable('Files');
  },
};
