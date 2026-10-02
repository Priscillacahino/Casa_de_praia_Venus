# Privacidade operacional — Vênus Casa de Praia

Este documento é um checklist técnico/operacional e não substitui revisão jurídica.

A aplicação trata nome, CPF do responsável, e-mail, telefone, datas, dados da reserva, documento de termo assinado quando aplicável e avaliações autorizadas. Questões financeiras são tratadas fora do site. O sistema registra somente um marcador administrativo de que o sinal foi conferido externamente, sem armazenar comprovante, chave Pix, dados bancários, método, referência ou transação.

Controles técnicos existentes incluem autenticação administrativa, MFA em produção, backups criptografados, minimização, retenção/anonimização, ausência de dados de cartão, proteção criptográfica do CPF em repouso e não persistência do código privado da reserva em Web Storage.

Em produção, `PII_ENCRYPTION_KEY` deve ser uma chave independente de 32 bytes em Base64 mantida no secret manager. Bancos anteriores devem passar por `npm run privacy:migrate-cpf` antes da liberação comercial. O preflight bloqueia CPF legado em texto simples.

As estruturas financeiras antigas `payments` e `banking` não fazem parte do banco novo. Bancos históricos podem ser inspecionados por `npm run legacy-finance:audit`. A limpeza automática só remove tabelas vazias/sem configuração; se houver histórico, o script interrompe sem apagar dados.

Antes da operação real ainda devem ser definidos e validados: responsável/controlador e canal de privacidade, base jurídica aplicável, prazo de retenção por categoria, procedimento de correção/exclusão, resposta a incidentes, fornecedores/operadores e processo para solicitações de titulares.
