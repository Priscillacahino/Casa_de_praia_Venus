# Checklist de publicação — Vênus Casa de Praia v2.3.9

**Data de consolidação:** 30/09/2026

Este documento substitui, para a versão atual, os checklists históricos de v2.2/v2.3.x. Ele separa o que pode ser concluído no repositório do que depende de infraestrutura, validação jurídica ou operação real.

## Concluído no código da v2.3.9

- [x] banco atualizado para schema 9;
- [x] CPF incluído na reserva e validado no backend;
- [x] termo de reserva e ciência de conservação consolidado na versão 2026-09-30-v4;

- [x] tabela pública com os valores atuais: R$ 120/noite para até 2 hóspedes em dias úteis e R$ 150/noite em sexta/sábado e feriados cadastrados;
- [x] adicional de R$ 50 por pessoa do 3º ao 6º hóspede, cobrado a cada noite da hospedagem;
- [x] cotação oficial continua calculada e revalidada no backend;
- [x] quantidade de hóspedes passa a integrar a cotação e a revalidação da reserva;
- [x] painel administrativo permite configurar hóspedes incluídos, adicional por pessoa e datas de feriado;
- [x] feriados cadastrados usam a tarifa especial de fim de semana;
- [x] reservas antigas preservam a cotação gravada no momento da solicitação;
- [x] interface PT/ES cobre a nova tabela e o detalhamento da cotação;
- [x] fonte Android do Guia deixa de apontar para `guia_offline.html` inexistente;
- [x] URL do Guia no APK passa a ser configurável e, no release, deve ser fixada em commit;
- [x] versão Android alinhada à v2.3.9;
- [x] nome da minuta corrigido para Vênus Casa de Praia; a minuta continua explicitamente não vigente;
- [x] cache PWA renovado;
- [x] testes automatizados específicos adicionados.

## Pendências externas antes de reservas com dinheiro real

- [ ] escolher/provisionar hospedagem para **Node.js 24** com processo e armazenamento persistentes;
- [ ] manter o frontend na Vercel apenas enquanto a API real não estiver servida em infraestrutura persistente;
- [ ] definir domínio definitivo com HTTPS para site + API;
- [ ] provisionar volume/disco protegido para o SQLite;
- [ ] configurar secret manager do provedor;
- [ ] gerar e configurar `ADMIN_PASSWORD_HASH`;
- [ ] gerar e configurar `ADMIN_TOTP_SECRET`;
- [ ] gerar e configurar `RESERVATION_TOKEN_SECRET`;
- [ ] gerar e configurar `AUDIT_HMAC_SECRET`;
- [ ] gerar e configurar `BACKUP_ENCRYPTION_KEY`;
- [ ] fixar `GUIDE_SOURCE_URL`/`VENUS_GUIDE_URL` em commit aprovado e registrar os SHA-256 correspondentes;
- [ ] executar `npm run production:check` no ambiente real;
- [ ] configurar backup externo criptografado e provar restauração em ambiente isolado;
- [ ] configurar monitoramento/alertas do backend;
- [ ] revisar juridicamente a versão exata da minuta e da política de privacidade;
- [ ] registrar nova aprovação jurídica após qualquer alteração do texto do termo;
- [ ] conferir os dados bancários reais antes de qualquer cobrança;
- [ ] testar pagamento, conciliação, cancelamento e reembolso com transações controladas;
- [ ] realizar revisão independente de segurança antes de aumentar volume financeiro.

## Homologação funcional

Antes da abertura comercial, registrar evidências para:

1. cotação de 2, 3, 4, 5 e 6 hóspedes;
2. adicional de R$ 50 por pessoa adicional a cada noite, inclusive em estadias de várias noites;
3. tarifa normal, sexta/sábado e feriado cadastrado;
4. conflito e prioridade temporária de datas;
5. protocolo e código privado;
6. termo GOV.BR, upload e validação administrativa;
7. WhatsApp oficial sem exposição do código privado;
8. aviso de pagamento sem confirmação automática;
9. conciliação bancária e confirmação;
10. cancelamento/reembolso;
11. backup + restauração;
12. PT/ES em desktop e celular;
13. Guia online/offline;
14. PWA em dispositivo real.

## Android

Para distribuir o APK:

- [ ] configurar `VENUS_BOOKING_URL` com o domínio HTTPS real;
- [ ] configurar `VENUS_GUIDE_URL` fixada em commit;
- [ ] configurar `VENUS_GUIDE_SHA256`;
- [ ] manter keystore e senhas fora do Git;
- [ ] executar `npm run android:release-check`;
- [ ] gerar APK release assinado;
- [ ] testar em aparelho real;
- [ ] publicar o SHA-256 do APK ao lado do download oficial.

## Critério de liberação

A presença do site público, do frontend na Vercel ou de CI verde **não libera cobrança real por si só**. A operação comercial com pagamento deve começar somente depois de fechar os bloqueios externos aplicáveis e registrar a homologação ponta a ponta.
