# Hardening pré-produção — Casa de Praia Vênus

## Escopo

Este bloco prepara a aplicação para operar futuramente com dados reais, sem iniciar a produção e sem alterar o banco real durante o desenvolvimento.

Os controles principais são:

1. conferência administrativa do sinal externo;
2. proteção do CPF em repouso;
3. proteção dos termos assinados em repouso;
4. retirada segura do legado financeiro interno;
5. backup criptografado e restauração verificável;
6. preflight de produção.

## Sinal conferido externamente

O pagamento continua fora do site.

O banco armazena somente o protocolo da reserva, a data/hora da conferência e o ator administrativo.

Não são armazenados comprovante, Pix, banco, método, referência, valor recebido nem transação.

## CPF

Novos CPFs são protegidos antes de serem gravados.

Em produção, `PII_ENCRYPTION_KEY` é obrigatória.

Bancos anteriores são migrados explicitamente com:

`npm run privacy:migrate-cpf`

O script não imprime o CPF e não executa automaticamente a migração geral de schema.

## Termos assinados

Novos PDFs assinados são protegidos com AES-256-GCM antes do armazenamento.

A aplicação mantém o SHA-256 do PDF original.

Bancos anteriores podem ser convertidos com:

`npm run privacy:migrate-signed-terms`

A rotina valida todos os documentos antes de iniciar a escrita e utiliza transação.

## Legado financeiro

Bancos novos não criam `payments` ou `banking`.

Para bancos anteriores:

- `npm run legacy-finance:audit` apenas inspeciona;
- `npm run legacy-finance:cleanup-empty` remove somente estruturas sem dados;
- qualquer registro ou configuração encontrada interrompe a limpeza.

## Backup

`npm run backup` cria backup criptografado quando `BACKUP_ENCRYPTION_KEY` está configurada.

`npm run backup:selftest` cria um banco temporário, realiza backup criptografado, restaura uma cópia separada e verifica integridade.

`npm run backup:key` gera uma nova chave Base64 de 32 bytes. A chave gerada não deve ser versionada.

## Ensaio isolado

`npm run preprod:db-rehearsal`

O ensaio usa somente um banco temporário. Ele simula CPF legado, PDF legado e estruturas financeiras vazias, executa as migrações e verifica o resultado.

Não utiliza o banco configurado da operação.

## Preflight

`npm run production:config-check` valida somente as variáveis exigidas para produção.

`npm run production:check` valida configuração, integridade do banco, schema, ausência das estruturas financeiras antigas, CPF protegido e termos assinados protegidos.

## Sequência futura para banco real

Somente depois da infraestrutura estar pronta:

1. parar o backend;
2. executar `legacy-finance:audit`;
3. criar backup criptografado;
4. restaurar o backup em arquivo separado e validar;
5. executar limpeza de legado somente se a auditoria permitir;
6. executar a migração de schema necessária;
7. executar `privacy:migrate-cpf`;
8. executar `privacy:migrate-signed-terms`;
9. verificar a cadeia de auditoria;
10. executar `production:check`;
11. iniciar o backend.

## Fora do escopo

Este bloco não processa pagamentos, não armazena comprovantes, não publica segredos, não migra o banco real e não substitui revisão jurídica, contábil ou de segurança independente.