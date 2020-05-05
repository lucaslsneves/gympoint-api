import { Model, DataTypes } from 'sequelize';

class Plan extends Model {
  static init(sequelize) {
    super.init(
      {
        title: DataTypes.STRING,
        duration: DataTypes.INTEGER,
        price: DataTypes.DECIMAL(10, 2),
        canceled_at: DataTypes.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.Registration, {
      foreignKey: 'plan_id',
      as: 'registrations',
    });
  }
}

export default Plan;
