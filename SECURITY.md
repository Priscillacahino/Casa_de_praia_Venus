# Política de Segurança

Este projeto contém fluxos de reserva, dados pessoais, documentos assinados e registros administrativos de operação. Esses itens devem ser tratados como dados sensíveis de operação, mesmo que o projeto ainda esteja em pré-produção.

## Regras obrigatórias de produção

- HTTPS obrigatório; `APP_URL` deve apontar para a origem HTTPS real.
- Senha administrativa somente como hash `scrypt`, gerado por `npm run admin:password`.
- Nunca versionar `.env`, banco SQLite, backups, dados bancários, documentos assinados ou segredos.
- O recebimento do sinal é conferido exclusivamente fora do site. O painel registra apenas o marcador administrativo de conferência externa, sem comprovante, chave Pix, dados bancários, método, referência ou transação.
- O site não processa nem armazena transações financeiras.
- Solicitações de cancelamento passam por análise administrativa.
- A sessão administrativa expira em duas horas e o painel administrativo não deve entrar no cache offline.
- A confirmação da reserva permanece bloqueada até a liberação administrativa da versão vigente do termo, validação do documento assinado, conferência externa do sinal e ausência de conflito de datas.
- CPF e termos assinados devem permanecer protegidos em repouso.
- `PII_ENCRYPTION_KEY` funciona como segredo mestre de proteção dos dados pessoais. O PDF assinado utiliza domínio criptográfico separado internamente.
- `BACKUP_ENCRYPTION_KEY` deve ser diferente de `PII_ENCRYPTION_KEY`.
- Backups de produção devem ser criptografados e a restauração precisa ser testada.
- Mudanças em autenticação, reservas, termos, privacidade ou banco exigem testes antes da publicação.

## Documentos assinados

Novos PDFs assinados são protegidos com AES-256-GCM antes de serem gravados no SQLite.

O SHA-256 registrado continua representando o PDF original recebido, permitindo conferir identidade do documento sem manter a cópia aberta no banco.

A leitura de PDFs legados em formato aberto existe apenas para permitir uma migração controlada. O preflight de produção rejeita a existência desses documentos até que `privacy:migrate-signed-terms` seja executado.

## Migrações

Scripts de migração de CPF, documentos assinados e limpeza de estruturas financeiras antigas abrem o SQLite diretamente. Eles não executam automaticamente a rotina geral de criação ou atualização de schema da aplicação.

Nenhuma migração em banco real deve ser executada sem:

1. aplicação parada;
2. auditoria do banco;
3. backup criptografado;
4. restauração do backup comprovada;
5. execução controlada das migrações;
6. nova verificação de integridade.

## Resposta a incidentes

O procedimento operacional está em `docs/INCIDENT_RESPONSE.md`. Preserve evidências antes de trocar credenciais ou restaurar backup.

## Comunicação de vulnerabilidade

Não abra issue pública contendo credenciais, dados pessoais, dados bancários, documentos assinados ou detalhes de exploração.

## Limites atuais

A aplicação não substitui contabilidade, revisão jurídica profissional, validação de assinatura pelo serviço oficial competente nem os controles do provedor de infraestrutura.

## Código privado de acompanhamento

`RESERVATION_TOKEN_SECRET` é separado das credenciais administrativas. Não deve ser versionado, reutilizado como senha ou enviado em URLs.