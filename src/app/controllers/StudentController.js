import * as Yup from 'yup';
import { Op } from 'sequelize';
import Registration from '../models/Registration';
import Student from '../models/Student';

export default {
  async index(req, res) {
    const { page = 1, perPage = 10, name = '', id } = req.query;

    if (id) {
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(400).json({ error: 'This student doesnt exists' });
      }

      return res.json(student);
    }

    const students = await Student.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
      limit: perPage,
      offset: (page - 1) * perPage,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(students.count / perPage);

    // Check if the student have a Registration

    const promises = await Promise.all(
      students.rows.map((student) =>
        Registration.findOne({ where: { student_id: student.id } })
      )
    );

    const data = students.rows.map((student, i) =>
      promises[i]
        ? { ...student.dataValues, delete: false }
        : { ...student.dataValues, delete: true }
    );

    return res.json({
      data,
      total: students.count,
      currentPage: page,
      perPage,
      totalPages,
    });
  },

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

  async update(req, res) {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(401).json({ error: 'This student doesnt exists' });
      }

      const schema = Yup.object().shape({
        name: Yup.string(),
        email: Yup.string().email(),
        age: Yup.number(),
        weight: Yup.number(),
        height: Yup.number(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation Fails' });
      }

      await student.update(req.body);

      return res.json(student);
    } catch (err) {
      return res.json({ error: 'Invalid id' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(401).json({ error: 'This student doesnt exists' });
      }

      await student.destroy();

      return res.json();
    } catch (error) {
      return res.status(400).json({ error });
    }
  },
};
