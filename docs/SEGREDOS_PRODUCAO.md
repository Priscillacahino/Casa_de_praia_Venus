# Segredos de produção — Casa de Praia Vênus

Este documento registra somente nomes, finalidade e comandos de geração. Nenhum valor real deve ser versionado.

## Variáveis sensíveis

- `ADMIN_PASSWORD_HASH`
- `ADMIN_TOTP_SECRET`
- `RESERVATION_TOKEN_SECRET`
- `AUDIT_HMAC_SECRET`
- `BACKUP_ENCRYPTION_KEY`
- `PII_ENCRYPTION_KEY`

`BACKUP_ENCRYPTION_KEY` e `PII_ENCRYPTION_KEY` devem ser diferentes.

A perda de `PII_ENCRYPTION_KEY` impede a recuperação dos dados protegidos por ela.

A perda de `BACKUP_ENCRYPTION_KEY` impede a restauração dos backups correspondentes.

## Outras variáveis de produção

- `NODE_ENV=production`
- `APP_URL`
- `DATABASE_PATH`
- `GUIDE_SOURCE_URL`
- `GUIDE_EXPECTED_SHA256`
- `TRUST_PROXY_HOPS`, quando necessário

## Geração local

Use:

- `npm run admin:password`
- `npm run admin:totp`
- `npm run reservation:secret`
- `npm run audit:secret`
- `npm run backup:key`
- `npm run pii:key`

Copie os valores diretamente para o gerenciador de segredos do provedor.

Não coloque os valores no GitHub, documentação, commits, capturas de tela ou mensagens.

## Conferência

Depois de configurar o provedor:

`npm run production:config-check`

A rotina verifica a presença e o formato dos valores sem imprimi-los.