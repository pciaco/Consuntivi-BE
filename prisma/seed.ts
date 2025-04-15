import { PrismaClient } from '@prisma/client'
import { startOfMonth, addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  const categorie = {
    Lavoro: ['In smart working', 'In presenza'],
    Reperibilità: ['Ordinaria', 'Intervento in reperibilità'],
    Ferie: ['Ferie'],
    Congedi: ['Matrimoniale', 'Maternità', 'Paternità', 'Maternità facoltativa'],
    Malattia: ['Malattia', 'Infortunio', 'Ricovero ospedaliero con carico', 'Ricovero ospedaliero senza carico'],
    Permessi: ['Maternità-Allattamento', 'Permesso ad ore', 'Permesso studio', 'Permesso donazione sangue', 'Permesso Lutto', 'Permesso L. 104', 'Permesso elettorale'],
    Formazione: ['Formazione in presenza', 'Formazione in smart working'],
  }

  for (const [categoria, tipi] of Object.entries(categorie)) {
    const cat = await prisma.categoriaEvento.upsert({
      where: { nome: categoria },
      update: {},
      create: { nome: categoria },
    })

    for (const tipo of tipi) {
      await prisma.tipoEvento.upsert({
        where: { nome: tipo },
        update: {},
        create: {
          nome: tipo,
          categoriaEventoId: cat.id,
        },
      })
    }
  }

  const utenti = [
    {
      id: 'aead91f7-7886-4739-bad4-ebb77554c118',
      name: 'Pietro Ciacor',
      email: 'pietro.ciaco@iad2.it',
    },
  ]

  for (const utente of utenti) {
    const user = await prisma.user.upsert({
      where: { id: utente.id },
      update: {},
      create: utente,
    })

    const today = new Date()
    const mese = today.getMonth() + 1
    const anno = today.getFullYear()

    const consuntivo = await prisma.consuntivo.create({
      data: {
        userId: user.id,
        mese,
        anno,
        stato: 'BOZZA',
      },
    })

    const tipoSmart = await prisma.tipoEvento.findFirst({
      where: { nome: 'In smart working' },
    })

    const tipoPresenza = await prisma.tipoEvento.findFirst({
      where: { nome: 'In presenza' },
    })

    if (tipoSmart && tipoPresenza) {
      await prisma.evento.createMany({
        data: [
          {
            consuntivoId: consuntivo.id,
            data: startOfMonth(today),
            ore: 8,
            tipoEventoId: tipoSmart.id,
          },
          {
            consuntivoId: consuntivo.id,
            data: addDays(startOfMonth(today), 1),
            ore: 8,
            tipoEventoId: tipoPresenza.id,
          },
        ],
      })
    }

    await prisma.ferie.create({
      data: {
        userId: user.id,
        inizio: new Date('2025-08-05T00:00:00'),
        fine: new Date('2025-08-09T00:00:00'),
        approvato: true,
        consuntivoId: consuntivo.id,
      },
    })

    await prisma.permesso.create({
      data: {
        userId: user.id,
        data: new Date('2025-08-12T00:00:00'),
        ore: 4,
        motivo: 'Permesso personale',
        approvato: true,
        consuntivoId: consuntivo.id,
      },
    })
  }

  console.log('✅ Seed completato.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
