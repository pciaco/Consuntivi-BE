import { PrismaClient } from '@prisma/client';
import { addDays, startOfMonth } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  const categorie = {
    Lavoro: ['In smart working', 'In presenza'],
    Reperibilità: ['Ordinaria', 'Intervento in reperibilità'],
    Ferie: ['Ferie'],
    Congedi: ['Matrimoniale', 'Maternità', 'Paternità', 'Maternità facoltativa'],
    Malattia: ['Malattia', 'Infortunio', 'Ricovero ospedaliero con carico', 'Ricovero ospedaliero senza carico'],
    Permessi: [
      'Maternità-Allattamento',
      'Permesso ad ore',
      'Permesso studio',
      'Permesso donazione sangue',
      'Permesso Lutto',
      'Permesso L. 104',
      'Permesso elettorale',
    ],
    Formazione: ['Formazione in presenza', 'Formazione in smart working'],
  };

  // Popola categorie e tipi evento
  for (const [categoria, tipi] of Object.entries(categorie)) {
    const cat = await prisma.categoriaEvento.upsert({
      where: { nome: categoria },
      update: {},
      create: { nome: categoria },
    });

    for (const tipo of tipi) {
      await prisma.tipoEvento.upsert({
        where: { nome: tipo },
        update: {},
        create: {
          nome: tipo,
          categoriaId: cat.id,
        },
      });
    }
  }

  // Popola utenti, consuntivi e eventi demo
  const utenti = [
    {
      id: 'BpTdgmytOJRjyuJ4BWmnLtR9302NQS77CEMuupT-v64',
      name: 'Mario Rossi',
      email: 'mario.rossi@azienda.it',
    },
    {
      id: 'Az1234567890abcdefgHijklmnOpqrstuvwxYz0987',
      name: 'Lucia Bianchi',
      email: 'lucia.bianchi@azienda.it',
    },
  ];

  for (const utente of utenti) {
    const user = await prisma.user.upsert({
      where: { id: utente.id },
      update: {},
      create: {
        id: utente.id,
        name: utente.name,
        email: utente.email,
      },
    });

    const today = new Date();
    const mese = today.getMonth() + 1;
    const anno = today.getFullYear();

    const consuntivo = await prisma.consuntivo.create({
      data: {
        userId: user.id,
        mese,
        anno,
        stato: 'BOZZA',
      },
    });

    const tipoSmart = await prisma.tipoEvento.findFirst({
      where: { nome: 'In smart working' },
    });

    const tipoPresenza = await prisma.tipoEvento.findFirst({
      where: { nome: 'In presenza' },
    });

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
      });
    }

        // Aggiungi ferie e permessi demo
        const inizioFerie = addDays(startOfMonth(today), 5);
        const fineFerie = addDays(inizioFerie, 2);
    
        await prisma.ferie.create({
          data: {
            userId: user.id,
            inizio: inizioFerie,
            fine: fineFerie,
            approvato: false,
          },
        });
    
        await prisma.permesso.create({
          data: {
            userId: user.id,
            data: addDays(startOfMonth(today), 10),
            ore: 2,
            motivo: 'Permesso donazione sangue',
            approvato: true,
          },
        });
    
  }
  

  console.log('Seed completato con successo.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
