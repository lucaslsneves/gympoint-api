import { Model, DataTypes } from 'sequelize';

class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        title: DataTypes.STRING,
        dutation: DataTypes.INTEGER,
        price: DataTypes.DECIMAL(10, 2),
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Student;
