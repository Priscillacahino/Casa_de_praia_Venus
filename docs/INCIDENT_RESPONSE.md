# Resposta a incidentes — Vênus Beach House

## Objetivo
Este procedimento reduz improviso diante de suspeita de vazamento, acesso indevido, fraude, perda de banco, exposição de código privado ou comprometimento de credenciais.

## Ações imediatas
1. Preserve logs, identificadores de requisição, horários e evidências. Não apague o banco nem os arquivos de auditoria.
2. Se houver risco ativo, retire temporariamente a aplicação pública do ar ou desabilite a função afetada.
3. Revogue/troque senha administrativa, segredo TOTP, segredo de reserva, chave de auditoria e demais credenciais potencialmente expostas.
4. Se o código privado de uma reserva tiver sido exposto, use a rotação administrativa para invalidar o anterior.
5. Verifique integridade do banco e da cadeia de auditoria antes de restaurar operação.
6. Registre quais dados, reservas, pessoas e períodos podem ter sido afetados.

## Recuperação
- restaure somente backup criptografado já validado;
- execute PRAGMA integrity_check, PRAGMA foreign_key_check, npm run audit:verify e os testes antes de reabrir;
- confirme HTTPS, segredos e controles de acesso do ambiente;
- documente causa, correção e prevenção de recorrência.

## Comunicação
A necessidade de comunicação a titulares, ANPD, instituições financeiras ou outras partes deve ser avaliada conforme natureza, risco e legislação aplicável. Não publique dados pessoais ou detalhes exploráveis em issue pública do GitHub.
