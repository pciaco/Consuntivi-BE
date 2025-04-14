import { FastifyInstance } from 'fastify';
import prisma from '../prisma';
import { Type } from '@sinclair/typebox';

const FerieBody = Type.Object({
  userId: Type.String(),
  inizio: Type.String({ format: 'date-time' }),
  fine: Type.String({ format: 'date-time' }),
  approvato: Type.Optional(Type.Boolean())
});

export default async function (app: FastifyInstance) {
  app.get('/', async (request) => {
    const { userId, anno } = request.query as {
      userId?: string;
      anno?: string;
    };

    const ferie = await prisma.ferie.findMany({
      where: {
        userId: userId || undefined,
        inizio: anno
          ? {
              gte: new Date(`${anno}-01-01`),
              lt: new Date(`${+anno + 1}-01-01`),
            }
          : undefined,
      },
      include: { user: true },
    });

    return ferie;
  });

  app.post('/', {
    schema: { body: FerieBody }
  }, async (request, reply) => {
    const { userId, inizio, fine, approvato } = request.body as typeof FerieBody.static;

    const ferie = await prisma.ferie.create({
      data: {
        userId,
        inizio: new Date(inizio),
        fine: new Date(fine),
        approvato: approvato ?? false,
      },
    });

    return reply.code(201).send(ferie);
  });
}
