import { Op } from 'sequelize';
import { subDays } from 'date-fns';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

export default {
  async store(req, res) {
    const { id: student_id } = req.params;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'This student doesnt exists' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id,
        created_at: {
          [Op.between]: [subDays(new Date(), 7), new Date()],
        },
      },
    });

    const checkinsPerWeek = 5;

    if (checkins.length >= checkinsPerWeek) {
      return res.status(401).json({
        error: `You have already reached the limit of ${checkinsPerWeek} checkins per week `,
      });
    }

    const checkin = await Checkin.create({ student_id });

    return res.json(checkin);
  },

  async index(req, res) {},
};
