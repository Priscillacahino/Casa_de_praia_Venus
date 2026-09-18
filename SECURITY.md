# Política de Segurança

Este projeto contém fluxos de reserva, dados pessoais, documentos assinados e registros financeiros. Esses itens devem ser tratados como dados sensíveis de operação, mesmo que o projeto ainda esteja em pré-produção.

## Regras obrigatórias de produção

- HTTPS obrigatório; `APP_URL` deve apontar para a origem HTTPS real.
- Senha administrativa somente como hash `scrypt`, gerado por `npm run admin:password`.
- Nunca versionar `.env`, banco SQLite, backups, dados bancários, documentos assinados ou chaves de assinatura.
- Confirmação de pagamento somente depois de conferir compensação no extrato. Comprovante enviado pelo hóspede não equivale a crédito recebido.
- Confirmação da reserva permanece bloqueada até: versão jurídica aprovada do termo, documento assinado validado, sinal mínimo conciliado e ausência de conflito de datas.
- Backup externo criptografado e teste periódico de restauração.
- Mudanças em autenticação, reservas, pagamentos, termos ou banco exigem testes antes de publicação.

## Comunicação de vulnerabilidade

Não abra issue pública contendo credenciais, dados pessoais, dados bancários, documentos assinados ou detalhes de exploração. Informe a responsável pelo repositório em canal privado.

## Limites atuais

A aplicação não substitui conciliação bancária, contabilidade, revisão jurídica, assinatura eletrônica validada pelo ITI nem controles do provedor de infraestrutura. Esses itens permanecem validações externas antes de operação comercial real.

## Código privado de acompanhamento

`RESERVATION_TOKEN_SECRET` é um segredo de produção separado das credenciais administrativas. Não versionar, não reutilizar como senha e não enviar em URLs. A aplicação envia o código privado da reserva em cabeçalho específico e os dados bancários só são liberados no contexto de uma reserva elegível.
