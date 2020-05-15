import { Op } from 'sequelize';
import * as Yup from 'yup';
import { isBefore, addMonths, parseISO } from 'date-fns';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

import RegistrationMail from '../jobs/RegistrationMail';

import Queue from '../lib/Queue';

export default {
  async index(req, res) {
    const { page = 1, perPage = 10, name = '' } = req.query;

    const registrations = await Registration.findAndCountAll({
      where: {
        '$student.name$': {
          [Op.iLike]: `%${name}%`,
        },
      },
      include: [
        { model: Student, as: 'student', attributes: ['name'] },
        { model: Plan, as: 'plan', attributes: ['title'] },
      ],

      limit: perPage,
      offset: (page - 1) * perPage,
    });

    const totalPages = Math.ceil(registrations.count / perPage);

    return res.json({
      data: registrations.rows,
      total: registrations.count,
      currentPage: page,
      perPage,
      totalPages,
    });
  },

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().positive().integer().required(),
      plan_id: Yup.number().positive().integer().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const parsedStartDate = parseISO(start_date);
    if (isBefore(parsedStartDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'This student doesnt exists' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'This plan doesnt exists' });
    }

    if (plan.canceled_at) {
      return res.status(400).json({ error: 'This plan was canceled' });
    }

    const registrationExist = await Registration.findOne({
      where: { student_id },
    });

    if (registrationExist) {
      return res
        .status(400)
        .json({ error: 'This student is already enrolled' });
    }

    const price = plan.price * plan.duration;
    const priceFormated = price.toFixed(2);
    const end_date = addMonths(parsedStartDate, plan.duration);

    const registration = await Registration.create({
      student_id,
      plan_id,
      price: priceFormated,
      start_date,
      end_date,
    });

    await Queue.add(RegistrationMail.key, { student, registration });

    return res.json(registration);
  },

  async update(req, res) {
    const keys = Object.entries(req.body);

    if (keys.length === 0) {
      return res
        .status(400)
        .json({ error: 'you have to change one field at least' });
    }
    const { id } = req.params;

    const registration = await Registration.findByPk(id);

    if (!registration) {
      return res.status(400).json({ error: 'This registration doesnt exist' });
    }

    const schema = Yup.object().shape({
      student_id: Yup.number().positive().integer(),
      plan_id: Yup.number().positive().integer(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    if (student_id) {
      const student = await Student.findByPk(student_id);

      if (!student) {
        return res.status(400).json({ error: 'This student doesnt exists' });
      }

      registration.student_id = student_id;
    }

    if (start_date) {
      const parsedStartDate = parseISO(start_date);

      if (isBefore(registration.start_date, new Date())) {
        return res
          .status(400)
          .json({ error: 'This registration already starts' });
      }

      const plan = await Plan.findByPk(registration.plan_id);

      registration.start_date = parsedStartDate;
      registration.end_date = addMonths(parsedStartDate, plan.duration);
    }

    if (plan_id) {
      const plan = await Plan.findByPk(plan_id);

      if (!plan) {
        return res.status(400).json({ error: 'This plan doesnt exists' });
      }

      const price = plan.price * plan.duration;

      registration.price = price.toFixed(2);

      registration.end_date = addMonths(registration.start_date, plan.duration);
    }

    await registration.save();

    return res.json(registration);
  },

  async delete(req, res) {
    const { id } = req.params;

    const registration = await Registration.findByPk(id);

    if (!registration) {
      return res.status(400).json({ error: 'This registration doesnt exists' });
    }

    await registration.destroy();

    return res.json();
  },
};
