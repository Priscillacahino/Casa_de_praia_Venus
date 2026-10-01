# Fluxo operacional da Casa de Praia Vênus — atendimento pelo WhatsApp

**Situação:** revisão técnica da v2.3.9; pendente homologação e liberação comercial.

## O que acontece no site

1. O hóspede consulta datas, quantidade de pessoas, tarifa, adicional por hóspede/noite e sinal **previsto**.
2. Envia a solicitação e recebe protocolo e código privado de acompanhamento. A prioridade temporária e os conflitos de datas continuam controlados pelo servidor.
3. Obtém o termo vigente após aprovação jurídica, assina o PDF pelo GOV.BR e envia a documentação. A administração verifica a assinatura, a identidade e o conteúdo.
4. Com o termo validado e a solicitação elegível, o hóspede inicia o atendimento pelo WhatsApp oficial; o site registra somente o início do atendimento, sem compartilhar o código privado.
5. Após as verificações realizadas fora do sistema, a administração decide se confirma a reserva. O site registra apenas o status da reserva e a respectiva auditoria. A disponibilidade é revalidada ao confirmar.
6. O hóspede acompanha a confirmação, pode solicitar cancelamento e, após a hospedagem, enviar uma avaliação sujeita à moderação.

## O que não acontece no site

- O site não executa cobrança, transação Pix, pagamento por cartão, transferência, conciliação nem reembolso.
- Dados de conta, chave Pix, link de cobrança, cartão, comprovantes e referências bancárias não devem ser enviados nem registrados no aplicativo.
- O hóspede não usa o botão antigo "Já realizei um pagamento"; essa função e as rotas de registro financeiro estão desativadas.
- As conversas financeiras e os procedimentos de cobrança e eventual devolução ocorrem pelo WhatsApp e pelos serviços externos escolhidos pelos responsáveis. Um comprovante encaminhado pelo hóspede, por si só, não comprova compensação.

## Proteções preservadas

A aprovação jurídica da versão exata do termo, a assinatura validada, a autenticação do administrador, a privacidade do protocolo/código, a idempotência, o controle de prioridade, as regras de preço e o bloqueio contra reservas sobrepostas continuam obrigatórios onde aplicáveis.

## Compatibilidade e pendências

As tabelas financeiras antigas permanecem no schema 9 **apenas para preservar eventuais dados anteriores**, sem interface nem endpoints de leitura/escrita de pagamentos. É necessário avaliar separadamente se há dados históricos e qual procedimento de retenção e exclusão segura é aplicável. Não executar exclusão de registros sem cópia de segurança e verificação das obrigações cabíveis.

Antes da operação comercial ainda são necessários backend Node.js 24 persistente com HTTPS, segredos seguros, proteção proporcional de CPF e PDFs, backup criptografado com teste de restauração, validação jurídica do termo e da política de privacidade, homologação em celular e testes do atendimento real **sem dados financeiros no site**. CI aprovado não equivale à liberação comercial.
