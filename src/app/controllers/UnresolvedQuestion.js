import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

export default {
  async index(req, res) {
    const { page = 1 } = req.query;
    const limit = 10;

    const helpOrders = await HelpOrder.findAll({
      where: {
        answer: null,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email', 'age'],
        },
      ],
      order: [['created_at']],
      offset: (page - 1) * limit,
      limit,
    });

    return res.json(helpOrders);
  },
};
