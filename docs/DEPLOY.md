# Deploy seguro — Vênus Beach House

## 1. Pré-requisitos

- Node.js 24+
- HTTPS real
- volume persistente para `data/`
- gerenciador de segredos do provedor
- backup externo criptografado

O backend endurecido não usa dependências NPM de runtime. `node:sqlite` é fornecido pelo Node 24.

## 2. Segredos

Copie `.env.example` para `.env` apenas no ambiente local. Em produção, prefira variáveis/secret manager do provedor.

Obrigatórios em produção:

- `APP_URL=https://seu-dominio`
- `NODE_ENV=production`
- `DATABASE_PATH=/caminho/persistente/venus.sqlite`
- `ADMIN_PASSWORD_HASH` gerado por `npm run admin:password`
- `ADMIN_TOTP_SECRET` gerado por `npm run admin:totp`
- `RESERVATION_TOKEN_SECRET` exclusivo, com pelo menos 32 caracteres
- `BACKUP_ENCRYPTION_KEY` com 32 bytes aleatórios em Base64
- `GUIDE_SOURCE_URL` em HTTPS
- `GUIDE_EXPECTED_SHA256` com o SHA-256 do HTML exato do Guia Vênus

A aplicação recusa inicialização em `NODE_ENV=production` se qualquer gate acima estiver ausente ou inválido.

Não configure `TRUST_PROXY_HOPS` por tentativa. Informe apenas a quantidade real de proxies reversos confiáveis.

## 3. Antes de subir

```bash
npm test
npm run lint
npm run audit:verify
npm run production:check
```

`production:check` é somente leitura e valida configuração, SQLite, chaves estrangeiras e versão do schema sem criar ou migrar o banco.

Em banco novo, `audit:verify` pode retornar zero eventos e isso é esperado.

## 4. Inicialização

```bash
npm start
```

Rotas principais:

- `/` — aplicação pública
- `/admin` — administração
- `/guia` — Guia Vênus integrado
- `/api/health` — health check

## 5. Backup

```bash
npm run backup
```

Em produção, o comando falha se `BACKUP_ENCRYPTION_KEY` não estiver configurada. Copie o `.enc` para armazenamento externo com controle de acesso e política de retenção. Periodicamente restaure em ambiente isolado:

```bash
npm run backup:restore -- backups/arquivo.sqlite.enc data/teste-restaurado.sqlite
```

O restore agora usa arquivo temporário e só publica o destino após `PRAGMA integrity_check` e `PRAGMA foreign_key_check` aprovados. Ainda valide o funcionamento do sistema em ambiente isolado antes de considerar o backup recuperável.

## 6. Android

O workflow CI provisiona Gradle 8.9 e JDK 17. Para apontar o botão de reserva do APK para o site seguro:

```properties
VENUS_BOOKING_URL=https://seu-dominio/#reserva
```

Coloque a propriedade em `~/.gradle/gradle.properties` ou em configuração segura de CI; não é segredo, mas deve apontar para HTTPS.

A chave de assinatura de release nunca deve entrar no repositório.

## Motor de reservas V2

Antes de publicar esta versão, gere e configure um segredo exclusivo para acompanhamento das reservas:

```bash
npm run reservation:secret
```

Salve o valor como `RESERVATION_TOKEN_SECRET` no gerenciador de segredos da infraestrutura. Não reutilize `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET` ou `BACKUP_ENCRYPTION_KEY`.

Depois da publicação, valide em ambiente controlado:

1. primeira solicitação recebe prioridade temporária;
2. nova cotação concorrente é bloqueada durante a prioridade;
3. uma solicitação concorrente direta entra sem prioridade;
4. o código privado correto consulta a reserva e um código incorreto recebe 404;
5. a rota pública geral não expõe dados bancários;
6. a rota específica só libera instruções quando a reserva está elegível;
7. expiração/liberação da prioridade permite concedê-la a outra solicitação;
8. duas reservas não podem ser confirmadas para datas sobrepostas.
