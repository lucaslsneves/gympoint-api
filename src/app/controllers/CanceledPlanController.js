import { Op } from 'sequelize';

import Plan from '../models/Plan';

export default {
  async index(req, res) {
    const { page = 1, perPage = 10, id } = req.query;

    if (id) {
      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(400).json({ error: 'This plan doesnt exists' });
      }

      return res.json(plan);
    }

    const plans = await Plan.findAndCountAll({
      where: {
        canceled_at: {
          [Op.ne]: null,
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

  async update(req, res) {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'This plan doesnt exists' });
    }

    plan.canceled_at = null;

    await plan.save();

    return res.json(plan);
  },
};
