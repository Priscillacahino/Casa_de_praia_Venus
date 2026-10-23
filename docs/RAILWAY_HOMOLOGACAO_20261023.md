# Homologação Railway — Casa de Praia Vênus (23/10/2026)

**Escopo:** preparação técnica da branch. Este pacote NÃO implanta o serviço, NÃO ativa pagamentos e NÃO modifica a branch `main`.

## Por que houve alteração no Dockerfile?

Railway monta volumes como `root` no início do contêiner. O Dockerfile anterior iniciava diretamente como `node`, que pode não conseguir gravar no volume. O novo `deploy/start-venus.sh` executa como root somente para preparar a pasta do volume e, em seguida, troca a identidade do processo para `node` via `gosu`.

O código de backup existente cria os arquivos em `./backups`; a nova imagem os direciona via symlink a `/data/backups`. **Isto ainda é backup no mesmo volume:** uma cópia automática externa e teste de restauração são obrigatórios antes do uso comercial.

## Preparação no Railway (sem ligar reservas comerciais)

1. Criar um projeto novo de teste, a partir da branch `fix/venus-prontidao-api-20261019` atualizada. Não conectar a branch `main` para deploy de produção.
2. Confirmar build via `Dockerfile` na raiz. Usar serviço com **uma réplica** e volume persistente em `/data`; manter modo serverless/sleep desabilitado, se aplicável.
3. Em Variables, configurar `RAILWAY_RUN_UID=0` para permitir a preparação inicial do volume; o entrypoint baixa os privilégios para o usuário `node` antes da execução da API.
4. Confirmar `NODE_ENV=production`, `DATABASE_PATH=/data/venus.sqlite`, `GUIDE_CACHE_PATH=/data/guia-venus-pb.html` e porta `PORT` compatível com o serviço. A imagem traz defaults, mas o provedor pode sobrescrever.
5. Gerar um domínio HTTPS de **homologação**. Informar a URL exata no `APP_URL` sem barra final (ex.: `https://SEU-SERVICO.up.railway.app`). Não copiar esta URL fictícia para configuração real.
6. Configurar as variáveis reais restantes com o gerenciador de segredos do Railway, conforme `.env.example`, `server/runtime-config.js` e `docs/DEPLOY.md`: `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, `RESERVATION_TOKEN_SECRET`, `AUDIT_HMAC_SECRET`, `BACKUP_ENCRYPTION_KEY`, `PII_ENCRYPTION_KEY`, `GUIDE_SOURCE_URL`, `GUIDE_EXPECTED_SHA256`. Nunca enviar valores à conversa nem ao GitHub.
7. Em `GUIDE_SOURCE_URL`, fixar o conteúdo de um SHA aprovado, e conferir o SHA-256 exato em `GUIDE_EXPECTED_SHA256`; não usar `main` como referência mutável para produção. Para proxy/IP use `TRUST_PROXY_HOPS` apenas após verificar a cadeia real.
8. Iniciar deployment com `Healthcheck Path: /api/ready`. **O Healthcheck não elimina a necessidade de monitorar uptime externamente.**
9. Confirmar `GET /api/ready` = HTTP 200 com `schemaVersion: 10`; `GET /api/public` = JSON. Não inserir dados pessoais reais ainda.
10. No shell do container rodando, executar `npm run production:check` e `npm run audit:verify` contra o banco do volume; rodar `npm run backup` após criar registros fictícios. Verificar `.enc` em `/data/backups` sem revelar conteúdo.
11. Habilitar snapshots do volume no Railway **e** cópia criptografada fora do provedor. Testar restauração em um ambiente isolado. Backups apenas no mesmo volume não contam como externos.
12. Fazer reservas fictícias de um celular e computador e testar reinício/redeploy, consulta, bloqueio de conflitos, termo assinado fictício, confirmação manual e cancelamento. Verificar segurança e dados de CPF com dados sintéticos.
13. Somente depois de validar todo o fluxo, decidir sobre o proxy `/api/*` da Vercel ou a mudança de domínio. A aplicação usa chamadas `/api` relativas à mesma origem; **não modificar a URL pública da Vercel antes de homologar**.

### Alertas importantes

- Um volume SQLite no Railway limita o serviço a uma réplica e pode produzir uma breve interrupção em redeploys. Não prometer disponibilidade sem interrupções.
- A `main` do GitHub e a produção Vercel são preservadas; mudar a branch usada pelo serviço Railway não muda automaticamente a `main`.
- As tarifas, hóspedes máximos, termos jurídicos e sinal recebido externamente precisam ser validados antes de ativar `pricingEnabled`.
- A aplicação armazena PDFs assinados dentro do SQLite; o tamanho do volume e dos backups precisa incluir essa informação.
- Esta validação técnica não substitui revisão jurídica, teste de restauração nem homologação comercial.

Referências: https://docs.railway.com/volumes , https://docs.railway.com/volumes/backups , https://vercel.com/docs/routing/rewrites
