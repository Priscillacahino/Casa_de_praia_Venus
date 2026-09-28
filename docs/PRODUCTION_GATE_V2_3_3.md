# Production gate v2.3.3

A v2.3.3 endurece o fluxo de contato, termo, assinatura e pagamento, mas o uso real só deve começar quando estes itens externos estiverem concluídos:

1. **Backend persistente** — o SQLite da aplicação precisa estar em armazenamento persistente e protegido. Vercel Functions não é tratada por este projeto como destino válido para o backend SQLite; a configuração de produção passa a bloquear esse cenário.
2. **HTTPS e domínio oficial** — `APP_URL` deve ser HTTPS válido.
3. **Segredos** — senha administrativa scrypt, TOTP, segredo de token de reserva, HMAC de auditoria e chave de backup devem estar no secret manager/provedor, nunca no Git.
4. **Backup/restore** — executar self-test e ensaio real de restauração antes de operar dados de hóspedes.
5. **Termo** — revisar juridicamente a versão vigente; qualquer alteração muda o hash e exige nova aprovação registrada.
6. **GOV.BR** — o PDF deve ser assinado no serviço oficial e validado antes do pagamento. Não se deve imprimir o PDF já assinado para “salvá-lo”, pois isso pode remover a assinatura eletrônica.
7. **Pagamento** — comprovante, WhatsApp ou aviso do hóspede não equivalem a recebimento; somente conciliação bancária administrativa altera o valor recebido.
8. **Homologação E2E** — testar reserva, assinatura, upload, validação, WhatsApp, sinal, confirmação, cancelamento e estorno em ambiente controlado.
9. **Android** — release assinado, hash publicado e teste em dispositivo real se o APK for distribuído.

O frontend pode continuar hospedado na Vercel. Para reservas reais, o backend deve estar em ambiente compatível com persistência e backups do SQLite, ou o banco deve ser migrado para uma solução persistente suportada.
