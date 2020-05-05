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
}

export default Plan;
