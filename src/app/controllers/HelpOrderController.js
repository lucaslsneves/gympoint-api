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

  async index(req, res) {},
};
