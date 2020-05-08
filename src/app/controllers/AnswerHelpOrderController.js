import * as Yup from 'yup';

import AnswerQuestion from '../jobs/AnswerQuestion';
import Student from '../models/Student';
import Queue from '../lib/Queue';
import HelpOrder from '../models/HelpOrder';

export default {
  async store(req, res) {
    const bodySchema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    const paramSchema = Yup.object().shape({
      id: Yup.number().positive().required(),
    });

    const { id } = req.params;
    const { answer } = req.body;

    const [paramIsValid, bodyIsValid] = await Promise.all([
      paramSchema.isValid({ id }),
      bodySchema.isValid(req.body),
    ]);

    if (!(bodyIsValid && paramIsValid)) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const helpOrder = await HelpOrder.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'This question doesnt exists' });
    }

    if (helpOrder.answer != null) {
      return res.status(400).json({ error: 'This question was resolverd' });
    }

    helpOrder.answer_at = new Date();
    helpOrder.answer = answer;

    await helpOrder.save();

    await Queue.add(AnswerQuestion.key, {
      helpOrder,
    });
    return res.json(helpOrder);
  },
};
