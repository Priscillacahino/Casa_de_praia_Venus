# Publicação segura do backend — Casa de Praia Vênus

**Situação:** material de implantação; nenhum ambiente de produção foi provisionado por este arquivo.

## Arquitetura necessária

O site em `/public` e a API em `/api` foram feitos para funcionar **na mesma origem HTTPS**. O deploy estático na Vercel não fornece automaticamente o processo Node.js com SQLite persistente. O backend deve rodar em um serviço Node 24 com disco/volume durável para `/data` e reverse proxy HTTPS. O `Dockerfile` é uma opção de empacotamento, não configura o disco nem o domínio automaticamente.

1. Provisionar um serviço de containers/Node 24 que suporte volume persistente. Montar o volume em `/data` e manter `DATABASE_PATH=/data/venus.sqlite`; nunca depender do armazenamento temporário de functions.
2. Configurar um domínio HTTPS para **site e API na mesma origem**, ou usar um reverse proxy devidamente configurado que envie ambos ao backend. Informar a origem exata em `APP_URL`.
3. Colocar no gerenciador de segredos do provedor os valores reais de `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, `RESERVATION_TOKEN_SECRET`, `AUDIT_HMAC_SECRET`, `BACKUP_ENCRYPTION_KEY`, `PII_ENCRYPTION_KEY`, além de `GUIDE_SOURCE_URL`, `GUIDE_EXPECTED_SHA256`, `APP_URL`, `NODE_ENV=production` e `DATABASE_PATH`.
4. Gerar senhas/chaves **no computador confiável**, conforme `.env.example` e `docs/DEPLOY.md`. Nunca enviar segredos para GitHub, conversas ou logs públicos.
5. Fixar `GUIDE_SOURCE_URL` em um SHA aprovado (não usar `/main/`). Calcular `GUIDE_EXPECTED_SHA256` a partir do HTML exato publicado.
6. Iniciar o serviço. Em banco novo ele criará o schema 10 sem tarifas ou reservas de exemplo; em banco existente, fazer backup e migrações controladas primeiro.
7. Rodar no contêiner/servidor `npm run production:check` (exige arquivo SQLite pré-existente) e `npm run audit:verify`. O primeiro deve concluir com `PREFLIGHT DE PRODUÇÃO: APROVADO`.
8. Checar `GET /api/health` (200, schema 10), `GET /api/ready` (200, schema 10) e `GET /api/public` (JSON real; configuração sem pagamentos).
9. Criar backup criptografado **externo ao contêiner** com agendamento e testar restauração em ambiente isolado antes de anunciar disponibilidade.
10. Configurar tarifas no painel e ativar `pricingEnabled` só quando regras comerciais, capacidade, termos e fluxo jurídico estiverem aprovados.
11. Testar reservas concorrentes, protocolo privado, assinatura GOV.BR conferida manualmente, confirmação administrativa, cancelamento e acesso em celular/desktop. O sinal é conferido externamente via WhatsApp, sem transações no site.
12. Somente após homologação, atualizar o destino do link público para o domínio do serviço funcional. Manter o endereço atual da Vercel como apresentação/preview até lá.

## Verificações úteis

```bash
npm test
npm run lint
npm run production:check
npm run audit:verify
```

Não rode migrações em banco com dados reais sem cópia de segurança verificável. Não exponha a porta 3001 diretamente sem proteção TLS/proxy. Confirme HTTPS e backup antes de cobranças.