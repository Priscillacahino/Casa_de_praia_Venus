# Homologação — Vênus Beach House v2.2.0

Este roteiro separa o que já foi validado no repositório do que precisa ser comprovado no ambiente real antes de qualquer operação comercial.

## 1. Preparação do ambiente

- [ ] provisionar domínio HTTPS;
- [ ] provisionar volume persistente e protegido para o SQLite;
- [ ] configurar secret manager do provedor;
- [ ] gerar e configurar `ADMIN_PASSWORD_HASH`;
- [ ] gerar e configurar `ADMIN_TOTP_SECRET`;
- [ ] gerar e configurar `RESERVATION_TOKEN_SECRET`;
- [ ] gerar e configurar `BACKUP_ENCRYPTION_KEY`;
- [ ] definir `GUIDE_SOURCE_URL` em HTTPS, preferencialmente fixada em commit;
- [ ] calcular e configurar `GUIDE_EXPECTED_SHA256`;
- [ ] configurar `VENUS_BOOKING_URL` para o domínio de homologação;
- [ ] executar `npm test`;
- [ ] executar `npm run lint`;
- [ ] executar `npm run audit:verify`;
- [ ] executar `npm run production:check`.

## 2. Reserva e concorrência

- [ ] cotação retorna valor esperado;
- [ ] primeira solicitação recebe prioridade temporária;
- [ ] cotação concorrente é bloqueada durante a prioridade;
- [ ] solicitação concorrente direta é tratada sem provocar dupla reserva;
- [ ] expiração/liberação permite nova prioridade;
- [ ] reservas sobrepostas não podem ser confirmadas;
- [ ] confirmação respeita termo, PDF validado e percentual de sinal configurado.

## 3. Acompanhamento do hóspede

- [ ] código privado correto consulta a reserva;
- [ ] código inválido não expõe dados;
- [ ] rotação administrativa gera novo código;
- [ ] código anterior deixa de funcionar;
- [ ] dados bancários só aparecem quando a reserva está elegível.

## 4. Financeiro

- [ ] pagamento liquidado exige conferência administrativa;
- [ ] referência bancária não pode ser reutilizada;
- [ ] pagamento não ultrapassa o total contratado;
- [ ] estorno não produz saldo negativo;
- [ ] painel financeiro apresenta bruto, estornos, líquido e saldo;
- [ ] exportação CSV abre sem executar fórmulas indevidas;
- [ ] fluxo de conciliação e reembolso é testado com transações controladas.

## 5. Avaliações

- [ ] somente reserva confirmada e já encerrada pode avaliar;
- [ ] uma estadia não pode gerar duas avaliações;
- [ ] autoria pública deriva da própria reserva;
- [ ] moderação administrativa funciona conforme previsto.

## 6. Auditoria e recuperação

- [ ] `npm run audit:verify` valida a cadeia;
- [ ] backup criptografado é gerado;
- [ ] backup é copiado para armazenamento externo controlado;
- [ ] restauração é executada em ambiente isolado;
- [ ] `integrity_check` e `foreign_key_check` aprovam o restaurado;
- [ ] destino existente é protegido contra sobrescrita acidental.

## 7. Guia Vênus

- [ ] conteúdo correto é aceito com SHA-256 correspondente;
- [ ] conteúdo divergente é rejeitado;
- [ ] cache funciona em contingência;
- [ ] download offline funciona;
- [ ] links externos abrem fora da WebView restrita.

## 8. Android

- [ ] build CI continua verde;
- [ ] APK release é compilado;
- [ ] assinatura usa keystore de produção fora do repositório;
- [ ] instalação em aparelho real é testada;
- [ ] botão de reserva abre o domínio HTTPS correto;
- [ ] fluxo do Guia funciona no aparelho.

## 9. Validações externas

- [ ] versão exata do termo revisada juridicamente;
- [ ] dados bancários reais conferidos antes de habilitar cobrança;
- [ ] processo de reembolso/conciliação validado operacionalmente;
- [ ] permissões da infraestrutura revisadas;
- [ ] revisão independente de segurança realizada antes de aumento relevante de volume financeiro.

## Critério de encerramento

A versão pode ser classificada como **homologada tecnicamente** quando os itens aplicáveis das seções 1 a 8 estiverem aprovados com evidência registrada.

Operação comercial real exige também o fechamento dos bloqueios da seção 9.
