import { FastifyInstance } from 'fastify';
import prisma from '../prisma';
import { Type } from '@sinclair/typebox';

const EventoBody = Type.Object({
  consuntivoId: Type.String(),
  data: Type.String({ format: 'date-time' }),
  ore: Type.Number({ minimum: 1, maximum: 24 }),
  tipoEventoId: Type.String(),
  descrizione: Type.Optional(Type.String())
});

export default async function (app: FastifyInstance) {
  app.get('/', async (request) => {
    const { mese, anno, userId } = request.query as {
      mese?: string;
      anno?: string;
      userId?: string;
    };

    const eventi = await prisma.evento.findMany({
      where: {
        consuntivo: {
          mese: mese ? Number(mese) : undefined,
          anno: anno ? Number(anno) : undefined,
          userId: userId || undefined,
        },
      },
      include: { tipoEvento: true, consuntivo: true },
    });

    return eventi;
  });

  app.post('/', {
    schema: { body: EventoBody }
  }, async (request, reply) => {
    const { consuntivoId, data, ore, tipoEventoId, descrizione } = request.body as typeof EventoBody.static;

    const evento = await prisma.evento.create({
      data: {
        consuntivoId,
        data: new Date(data),
        ore,
        tipoEventoId,
        descrizione,
      },
    });

    return reply.code(201).send(evento);
  });
}
