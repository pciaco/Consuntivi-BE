import Fastify from 'fastify';
import cors from '@fastify/cors';
import usersRoutes from './routes/users';
import consuntiviRoutes from './routes/consuntivi';
import eventiRoutes from './routes/eventi';
import ferieRoutes from './routes/ferie';
import permessiRoutes from './routes/permessi';

const app = Fastify();

app.register(cors, { origin: true });

app.register(usersRoutes, { prefix: '/users' });
app.register(consuntiviRoutes, { prefix: '/consuntivi' });
app.register(eventiRoutes, { prefix: '/eventi' });
app.register(ferieRoutes, { prefix: '/ferie' });
app.register(permessiRoutes, { prefix: '/permessi' });

app.listen({ port: 3001 }, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server in ascolto su http://localhost:3001');
});
