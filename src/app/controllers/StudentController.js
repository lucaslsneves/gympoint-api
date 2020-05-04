import * as Yup from 'yup';
import Student from '../models/Student';

export default {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { email } = req.body;

    const emailExists = await Student.findOne({ where: { email } });

    if (emailExists) {
      return res.status(400).json({ error: 'This email is already in use' });
    }

    const student = await Student.create(req.body);

    return res.json(student);
  },

  async update(req, res) {},
};
