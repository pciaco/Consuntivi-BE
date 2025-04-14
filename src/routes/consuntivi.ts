import { FastifyInstance } from 'fastify';
import prisma from '../prisma';
import { Type } from '@sinclair/typebox';

const ConsuntivoBody = Type.Object({
  userId: Type.String(),
  mese: Type.Number({ minimum: 1, maximum: 12 }),
  anno: Type.Number(),
  stato: Type.String()
});

export default async function (app: FastifyInstance) {
  app.get('/', async (request) => {
    const { mese, anno, userId } = request.query as {
      mese?: string;
      anno?: string;
      userId?: string;
    };

    const consuntivi = await prisma.consuntivo.findMany({
      where: {
        mese: mese ? Number(mese) : undefined,
        anno: anno ? Number(anno) : undefined,
        userId: userId || undefined,
      },
      include: { eventi: true, user: true },
    });

    return consuntivi;
  });

  app.post('/', {
    schema: { body: ConsuntivoBody }
  }, async (request, reply) => {
    const { userId, mese, anno, stato } = request.body as typeof ConsuntivoBody.static;

    const consuntivo = await prisma.consuntivo.create({
      data: { userId, mese, anno, stato },
    });

    return reply.code(201).send(consuntivo);
  });
}
