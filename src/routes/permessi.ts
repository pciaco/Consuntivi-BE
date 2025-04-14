import { FastifyInstance } from 'fastify';
import prisma from '../prisma';
import { Type } from '@sinclair/typebox';

const PermessoBody = Type.Object({
  userId: Type.String(),
  data: Type.String({ format: 'date-time' }),
  ore: Type.Number({ minimum: 1, maximum: 24 }),
  motivo: Type.String(),
  approvato: Type.Optional(Type.Boolean())
});

export default async function (app: FastifyInstance) {
  app.get('/', async (request) => {
    const { userId, anno } = request.query as {
      userId?: string;
      anno?: string;
    };

    const permessi = await prisma.permesso.findMany({
      where: {
        userId: userId || undefined,
        data: anno
          ? {
              gte: new Date(`${anno}-01-01`),
              lt: new Date(`${+anno + 1}-01-01`),
            }
          : undefined,
      },
      include: { user: true },
    });

    return permessi;
  });

  app.post('/', {
    schema: { body: PermessoBody }
  }, async (request, reply) => {
    const { userId, data, ore, motivo, approvato } = request.body as typeof PermessoBody.static;

    const permesso = await prisma.permesso.create({
      data: {
        userId,
        data: new Date(data),
        ore,
        motivo,
        approvato: approvato ?? false,
      },
    });

    return reply.code(201).send(permesso);
  });
}
