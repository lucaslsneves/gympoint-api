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

  async store(req, res) {},

  async update(req, res) {},

  async delete(req, res) {},
};
