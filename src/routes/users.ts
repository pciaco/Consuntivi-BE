import { FastifyInstance } from 'fastify';
import prisma from '../prisma';

export default async function (app: FastifyInstance) {
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        consuntivi: true,
        ferie: true,
        permessi: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ message: 'Utente non trovato' });
    }

    return user;
  });
}
