import { Model, DataTypes } from 'sequelize';

class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        age: DataTypes.INTEGER,
        weight: DataTypes.FLOAT,
        height: DataTypes.FLOAT,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Student;
