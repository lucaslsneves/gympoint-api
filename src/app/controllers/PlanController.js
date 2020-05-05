import * as Yup from 'yup';

import Plan from '../models/Plan';

export default {
  async index(req, res) {
    const { id } = req.query;

    if (id) {
      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(400).json({ error: 'This plan doesnt exists' });
      }

      return res.json(plan);
    }
    const plans = await Plan.findAll();

    return res.json(plans);
  },

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().positive().integer().required(),
      price: Yup.number().positive().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const planExist = await Plan.findOne({ where: { title } });

    if (planExist) {
      return res.status(400).json({ error: 'This plan already exists' });
    }

    const plan = await Plan.create(req.body);

    return res.json(plan);
  },

  async update(req, res) {
    const keys = Object.entries(req.body);

    if (!keys.length) {
      return res.json({ error: 'You need to change at least 1 field' });
    }

    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'This plan doesnt exists' });
    }

    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().positive().integer(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    await plan.update(req.body);

    return res.json(plan);
  },

  async delete(req, res) {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'This plan doesnt exists' });
    }

    if (plan.canceled_at) {
      return res.status(400).json({ error: 'This plan was canceled already' });
    }

    plan.canceled_at = new Date();

    await plan.save();

    return res.json();
  },
};
