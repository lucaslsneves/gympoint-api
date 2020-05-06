import * as Yup from 'yup';
import { isBefore, addMonths, parseISO } from 'date-fns';
import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

export default {
  async index(req, res) {
    const { id } = req.query;

    if (id) {
      const registration = await Registration.findByPk(id);

      if (!registration) {
        return res
          .status(400)
          .json({ error: 'This registration doesnt exists' });
      }

      return res.json(registration);
    }
    const registrations = await Registration.findAll();

    return res.json(registrations);
  },

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.string().required(),
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

    return res.json(registration);
  },

  async update(req, res) {},

  async delete(req, res) {},
};
