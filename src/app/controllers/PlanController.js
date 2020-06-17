import { Op } from 'sequelize';
import * as Yup from 'yup';

import Plan from '../models/Plan';

export default {
  async index(req, res) {
    const { page = 1, perPage = 10, id, title = '' } = req.query;

    if (id) {
      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(400).json({ error: 'This plan doesnt exists' });
      }

      return res.json(plan);
    }

    const plans = await Plan.findAndCountAll({
      where: {
        canceled_at: null,
        title: {
          [Op.iLike]: `%${title}%`,
        },
      },
      limit: perPage,
      offset: (page - 1) * perPage,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(plans.count / perPage);

    return res.json({
      data: plans.rows,
      total: plans.count,
      currentPage: page,
      perPage,
      totalPages,
    });
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
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'This plan doesnt exists' });
    }

    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().positive().integer(),
      price: Yup.number().positive(),
      canceled_at: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const titleExist = await Plan.findOne({
      where: {
        title: req.body.title,
        id: {
          [Op.ne]: plan.id,
        },
      },
    });

    if (titleExist) {
      return res
        .status(400)
        .json({ error: 'This title is already being used' });
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
