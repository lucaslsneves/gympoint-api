import { Model, DataTypes } from 'sequelize';

class HelpOrder extends Model {
  static init(sequelize) {
    super.init(
      {
        student_id: DataTypes.INTEGER,
        question: DataTypes.STRING,
        answer: DataTypes.STRING,
        answer_at: DataTypes.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
  }
}

export default HelpOrder;
