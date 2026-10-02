# Política de Segurança

Este projeto contém fluxos de reserva, dados pessoais, documentos assinados e registros administrativos de operação. Esses itens devem ser tratados como dados sensíveis de operação, mesmo que o projeto ainda esteja em pré-produção.

## Regras obrigatórias de produção

- HTTPS obrigatório; `APP_URL` deve apontar para a origem HTTPS real.
- Senha administrativa somente como hash `scrypt`, gerado por `npm run admin:password`.
- Nunca versionar `.env`, banco SQLite, backups, dados bancários, documentos assinados ou chaves de assinatura.
- O recebimento do sinal é conferido exclusivamente fora do site. O painel registra apenas o marcador administrativo “sinal conferido externamente”, sem comprovante, chave Pix, dados bancários, método, referência ou transação.
- O site público não deve expor chave Pix, agência, conta ou documento bancário da propriedade; esses dados são tratados no atendimento pelo canal oficial.
- Solicitações de cancelamento do hóspede usam protocolo + código privado, passam por análise administrativa e bloqueiam novas entradas enquanto estiverem pendentes.
- A sessão administrativa expira em duas horas e o painel administrativo não deve ser armazenado no cache offline.
- Confirmação da reserva permanece bloqueada até: versão jurídica aprovada do termo, documento assinado validado, sinal conferido externamente e ausência de conflito de datas.
- CPF armazenado deve permanecer protegido em repouso por `PII_ENCRYPTION_KEY`; a chave não pode ser versionada nem reutilizada em outras funções.
- Backup externo criptografado e teste periódico de restauração.
- Mudanças em autenticação, reservas, pagamentos, termos ou banco exigem testes antes de publicação.

## Resposta a incidentes

O procedimento operacional está em `docs/INCIDENT_RESPONSE.md`. Preserve evidências antes de trocar credenciais ou restaurar backup.

## Comunicação de vulnerabilidade

Não abra issue pública contendo credenciais, dados pessoais, dados bancários, documentos assinados ou detalhes de exploração. Informe a responsável pelo repositório em canal privado.

## Limites atuais

A aplicação não substitui conciliação bancária, contabilidade, revisão jurídica, assinatura eletrônica validada pelo ITI nem controles do provedor de infraestrutura. Esses itens permanecem validações externas antes de operação comercial real.

## Código privado de acompanhamento

`RESERVATION_TOKEN_SECRET` é um segredo de produção separado das credenciais administrativas. Não versionar, não reutilizar como senha e não enviar em URLs. A aplicação envia o código privado da reserva em cabeçalho específico e os dados bancários só são liberados no contexto de uma reserva elegível.
