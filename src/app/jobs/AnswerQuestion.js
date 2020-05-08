import Mail from '../lib/Mail';

export default {
  key: 'AnswerQuestion',
  async handle({ data }) {
    const { helpOrder } = data;

    await Mail.sendMail({
      from: 'Queue Test <queue@queueteste.com>',
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Cadastro de usuário',
      html: `
      Olá, ${helpOrder.student.name}, já tiramos a sua dúvida <br/>
      Sua pergunta: "${helpOrder.question}" <br/>
      Nossa resposta: ${helpOrder.answer}
     `,
    });
  },
};
