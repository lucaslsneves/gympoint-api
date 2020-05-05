import { Model, DataTypes } from 'sequelize';

class Registration extends Model {
  static init(sequelize) {
    super.init(
      {
        student_id: DataTypes.INTEGER,
        plan_id: DataTypes.INTEGER,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Registration;
