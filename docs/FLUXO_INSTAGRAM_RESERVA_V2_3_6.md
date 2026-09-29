# Fluxo Instagram → Reserva → WhatsApp → Confirmação — v2.3.6

## Objetivo

Preparar a experiência Web/PWA da **Vênus Casa de Praia** para o fluxo comercial combinado:

**Instagram → site → disponibilidade → solicitação → termo GOV.BR → WhatsApp → pagamento → conferência bancária → confirmação no site.**

A v2.3.6 não habilita pagamentos sozinha e não remove nenhum controle de segurança da v2.3.5.

## O que foi adiantado

### Calendário de disponibilidade

A página de reserva passa a consultar `/api/availability` e exibir um calendário visual.

O calendário:
- usa a API do servidor como fonte de verdade;
- não expõe nome, telefone ou qualquer dado de outro hóspede;
- considera indisponíveis reservas confirmadas, bloqueios administrativos e prioridades temporárias ativas;
- mantém os campos nativos de check-in/check-out como alternativa;
- a cotação continua sendo recalculada e validada no servidor.

### Retorno do WhatsApp

O WhatsApp continua abrindo fora do fluxo financeiro do site. O código privado nunca é colocado na URL nem enviado ao WhatsApp.

Quando o visitante volta à aba do site:
- a situação da reserva é consultada novamente;
- o calendário é atualizado;
- o visitante vê se o pagamento foi apenas informado, conciliado ou se a reserva já foi confirmada.

Não existe polling contínuo. A atualização automática acontece somente ao voltar para a aba/janela, com limite mínimo entre consultas.

### Acompanhamento temporário nesta aba

Após uma consulta válida, protocolo e código privado ficam no `sessionStorage` do navegador para facilitar o retorno do WhatsApp.

Características:
- não usa `localStorage`;
- não coloca o código na URL;
- não envia o código ao WhatsApp;
- o visitante pode usar **Esquecer acesso deste dispositivo**;
- ao fechar a sessão da aba/navegador, o armazenamento temporário deixa de ser o mecanismo de continuidade.

### Linha de progresso

O hóspede passa a visualizar:

1. Datas
2. Solicitação
3. Termo
4. WhatsApp / pagamento
5. Conferência bancária
6. Confirmada

A confirmação continua dependendo das regras já existentes no backend.

## O que continua manual por segurança

- assinatura GOV.BR;
- validação administrativa do PDF assinado;
- envio dos dados Pix/transferência pelo WhatsApp oficial;
- conferência do crédito no banco;
- registro do pagamento conciliado;
- confirmação administrativa da reserva.

O botão **Já realizei um pagamento** continua sendo apenas um aviso do hóspede. Ele não transforma comprovante em pagamento recebido.

## Produção

Para o fluxo do Instagram funcionar de verdade, a recomendação é servir **site + API no mesmo domínio HTTPS** a partir de um provedor que suporte:

- Node.js 24;
- processo persistente;
- volume/disco persistente para SQLite;
- secret manager;
- backup externo.

A Vercel continua adequada para homologação visual do front-end, mas o backend Node + SQLite não deve operar em Vercel Functions com reservas reais.

## Guia Vênus

O `.env.example` deixa de apontar para o antigo `guia_offline.html`.

O exemplo passa a usar a cópia autônoma existente em:

`public/guia/index.html`

Em produção, substitua `main` por um SHA de commit aprovado e configure o `GUIDE_EXPECTED_SHA256` correspondente.
