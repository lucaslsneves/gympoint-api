import * as Yup from 'yup';

import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

export default {
  async store(req, res) {
    const bodySchema = Yup.object().shape({
      question: Yup.string().required(),
    });

    const paramSchema = Yup.object().shape({
      id: Yup.number().positive().required(),
    });

    const { id } = req.params;
    const { question } = req.body;

    const [paramIsValid, bodyIsValid] = await Promise.all([
      paramSchema.isValid({ id }),
      bodySchema.isValid(req.body),
    ]);

    if (!(bodyIsValid && paramIsValid)) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'This student doesnt exists' });
    }

    const helpOrder = await HelpOrder.create({
      student_id: id,
      question,
    });

    return res.json(helpOrder);
  },

  async index(req, res) {
    const { id } = req.params;

    const paramSchema = Yup.object().shape({
      id: Yup.number().positive().required(),
    });

    if (!(await paramSchema.isValid({ id }))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'This student doesnt exists' });
    }

    const { page = 1 } = req.query;
    const limit = 10;

    const helpOrders = await HelpOrder.findAll({
      where: {
        student_id: id,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });

    return res.json(helpOrders);
  },
};
