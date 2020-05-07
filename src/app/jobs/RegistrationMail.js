import Mail from '../lib/Mail';

export default {
  key: 'RegistrationMail',
  async handle({ data }) {
    const { student } = data;

    await Mail.sendMail({
      from: 'Queue Test <queue@queueteste.com>',
      to: `${student.name} <${student.email}>`,
      subject: 'Cadastro de usuário',
      html: `Olá, ${student.name},bem-vindo a Gympoint`,
    });
  },
};
