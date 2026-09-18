# Motor de Reservas V2 — Vênus Beach House

Data: 18/09/2026

## Objetivo

Este bloco transforma a solicitação de reserva em um fluxo operacional mais próximo de uma aplicação real, sem remover os controles financeiros e jurídicos já existentes.

## Implementações

### 1. Política de reserva configurável

A administração passa a definir:

- antecedência mínima para check-in;
- antecedência máxima para reservas futuras;
- quantidade máxima de noites por estadia;
- duração da prioridade temporária de uma solicitação;
- capacidade máxima de hóspedes;
- taxa de limpeza e tarifas por período já existentes.

As regras são aplicadas no servidor. O navegador não é autoridade para preços ou elegibilidade.

### 2. Prioridade temporária de datas

Ao registrar uma solicitação elegível, o sistema tenta conceder uma prioridade temporária para o período.

- uma prioridade ativa aparece como indisponibilidade na cotação pública;
- a prioridade expira automaticamente;
- a administração pode conceder, renovar ou liberar a prioridade;
- uma segunda solicitação concorrente pode ser registrada como fila de espera, mas não recebe prioridade;
- a confirmação definitiva continua exigindo nova verificação de conflito.

A prioridade temporária não é uma reserva confirmada e não substitui termo, pagamento ou conciliação.

### 3. Acompanhamento privado do hóspede

Cada solicitação recebe:

- protocolo público da solicitação;
- código privado derivado por HMAC com segredo exclusivo do servidor.

O código não é salvo em texto puro no banco e não é enviado na URL. O front-end o envia em cabeçalho privado para consultar:

- situação da solicitação;
- datas e quantidade de noites;
- total contratado;
- valor recebido;
- saldo;
- situação da prioridade temporária.

Em produção, `RESERVATION_TOKEN_SECRET` é obrigatório e deve ter pelo menos 32 caracteres de alta entropia.

### 4. Dados bancários com escopo por reserva

A rota pública geral de meios de pagamento não expõe banco, agência, conta ou chave Pix.

Dados bancários somente podem ser consultados quando:

- o código privado da reserva é válido;
- a versão jurídica vigente está aprovada;
- a solicitação possui prioridade temporária ativa ou já está confirmada;
- os dados bancários foram configurados pela administração.

### 5. Histórico operacional da reserva

Foi criada `reservation_events`, separada da trilha global de auditoria, para registrar eventos operacionais como:

- solicitação criada;
- prioridade concedida;
- prioridade renovada;
- prioridade liberada;
- confirmação;
- cancelamento.

A trilha global de auditoria encadeada por hash continua existindo.

## Banco de dados

Novas tabelas:

- `reservation_holds` — prioridades temporárias com expiração;
- `reservation_events` — histórico operacional por reserva.

`PRAGMA user_version` passa para 4.

## Segurança

- segredo de acompanhamento separado da senha administrativa;
- token determinístico por HMAC sem armazenamento em texto puro;
- comparação em tempo constante;
- token transmitido em cabeçalho, não em query string;
- dados bancários removidos da resposta pública genérica;
- solicitações concorrentes não conseguem confirmar duas reservas para o mesmo período.

## Testes

A suíte combinada passou com 8/8 testes:

- 6 testes anteriores de segurança, financeiro, idempotência, conflitos, pagamentos, CSV e backup;
- 2 novos testes de política de reserva, prioridade temporária, fila concorrente, token privado e transferência administrativa da prioridade.

A verificação estrutural (`npm run lint`) também foi executada com sucesso no pacote.

## Limites atuais

Este bloco ainda não transforma o sistema em produção financeira. Permanecem pendentes, entre outros:

- publicação em infraestrutura HTTPS real;
- MFA e segredos configurados no ambiente;
- teste real do APK Android;
- validação jurídica final do termo;
- teste controlado de ciclo financeiro completo;
- backup/restore em infraestrutura real;
- integração futura com notificações reais e, se desejado, provedor de pagamento.
