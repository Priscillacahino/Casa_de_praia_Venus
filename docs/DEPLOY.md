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
- `BACKUP_ENCRYPTION_KEY` com 32 bytes aleatórios em Base64

Não configure `TRUST_PROXY_HOPS` por tentativa. Informe apenas a quantidade real de proxies reversos confiáveis.

## 3. Antes de subir

```bash
npm test
npm run lint
npm run audit:verify
```

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

Valide `PRAGMA integrity_check` e o funcionamento do sistema antes de considerar o backup recuperável.

## 6. Android

O workflow CI provisiona Gradle 8.9 e JDK 17. Para apontar o botão de reserva do APK para o site seguro:

```properties
VENUS_BOOKING_URL=https://seu-dominio/#reserva
```

Coloque a propriedade em `~/.gradle/gradle.properties` ou em configuração segura de CI; não é segredo, mas deve apontar para HTTPS.

A chave de assinatura de release nunca deve entrar no repositório.
