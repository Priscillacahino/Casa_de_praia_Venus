# Implantação e operação

## Requisitos concretos

- Servidor/container Node 24, uma instância, com volume persistente em `/app/data`.
- HTTPS na frente da aplicação. `APP_URL` deve ser a origem exata, sem barra final (ex.: `https://casa.exemplo.com`).
- `ADMIN_PASSWORD_HASH` gerado localmente por `npm run admin:password`.
- `NODE_ENV=production`; `DATABASE_PATH=/app/data/venus.sqlite`; `PORT=3001`.
- Configure `TRUST_PROXY_HOPS` apenas após verificar a topologia do proxy. Não confie em cabeçalhos encaminhados arbitrariamente. Sem esse ajuste o limitador pode agrupar visitantes pelo IP do proxy.
- Backup externo protegido, monitoramento de `/api/health` e capacidade de restauração.

O Dockerfile prepara o frontend e a API. Crie volumes com permissão de escrita para UID 1000. Mantenha os volumes entre reinícios e atualizações. Não escale esta versão para várias instâncias com cópias independentes do SQLite. Para Vercel serverless ou múltiplas instâncias, migre para PostgreSQL gerenciado antes de publicar; é uma mudança de persistência, não uma simples variável.

## Banco e backup

O esquema é criado automaticamente (`server/db.js`, versão 1). `npm run backup` usa a API de backup SQLite e não uma cópia inconsistente do arquivo aberto. Copie os backups para armazenamento externo com acesso restrito. O repositório ignora dados, backups e segredos.

Restauração: pare a aplicação; preserve uma cópia do diretório atual; use um backup conferido como `venus.sqlite` em um diretório de dados novo, sem arquivos WAL/SHM de outra versão; configure `DATABASE_PATH` para ele e reinicie. Confira `PRAGMA integrity_check` e algumas reservas antes de reabrir operação. Faça esse ensaio em ambiente separado antes de depender do backup em produção.

## Conferência após publicar

1. Conferir login/logout, acesso negado às rotas administrativas sem sessão e cookie Secure.
2. Confirmar que `/api/public` e `/api/availability` não expõem nomes, e-mails ou telefones dos hóspedes.
3. Cadastrar tarifas reais, sinal, limpeza, capacidade e bloqueios externos.
4. Abrir dois navegadores e tentar confirmar pedidos sobrepostos. O segundo deve ser recusado.
5. Confirmar valores em centavos, mínimo de noites, troca de tarifas e saída sem diária adicional.
6. Conferir link do WhatsApp no celular e destino do Maps. Não enviar mensagens a clientes durante testes sem autorização.
7. Instalar PWA em Android e iPhone e testar falta de conexão. Nenhum envio deve ser anunciado como concluído sem resposta da API.
8. Conferir exportações CSV/ICS e restaurar um backup em ambiente isolado.

## Integrações e decisões pendentes

- O número e o link Maps vieram do código original; precisam de confirmação da proprietária.
- Para mapa incorporado, cadastrar o `src` do iframe obtido em Compartilhar → Incorporar um mapa. Um link curto não foi convertido em coordenadas presumidas.
- WhatsApp nesta versão é contato iniciado pelo visitante. Automação Business exige integração adicional com credenciais e configuração próprias; não foi simulada.
- ICS é arquivo para importação manual, não sincronização bidirecional.
- As tarifas originais de exemplo foram removidas; cadastre os valores reais antes de ativar pedidos.

Referências técnicas consultadas: [PWA instalável](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started), [Node SQLite](https://nodejs.org/api/sqlite.html).
