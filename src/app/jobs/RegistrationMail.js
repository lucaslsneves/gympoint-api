import { format, parseISO } from 'date-fns';
import Mail from '../lib/Mail';

export default {
  key: 'RegistrationMail',
  async handle({ data }) {
    const { student, registration } = data;

    await Mail.sendMail({
      from: 'Queue Test <queue@queueteste.com>',
      to: `${student.name} <${student.email}>`,
      subject: 'Cadastro de usuário',
      html: `Olá, ${student.name},bem-vindo a Gympoint <br/>
      Data de início do plano: ${format(
        parseISO(registration.start_date),
        `dd/MM/yyyy`
      )} <br/>
      Data de término do plano: ${format(
        parseISO(registration.end_date),
        `dd/MM/yyyy`
      )} <br/>
      Valor: R$ ${registration.price}`,
    });
  },
};
