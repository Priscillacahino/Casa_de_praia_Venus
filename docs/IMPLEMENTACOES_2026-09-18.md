# Implementações da auditoria — 18/09/2026

## Backend e financeiro

- backend Node/SQLite restaurado em arquitetura reduzida, sem dependências NPM de runtime;
- cálculo de cotação somente no servidor;
- reserva idempotente com hash do pedido;
- bloqueio transacional contra sobreposição de datas;
- confirmação condicionada a termo, PDF validado, sinal e disponibilidade;
- referência bancária única no SQLite;
- limites para pagamento e estorno;
- trilha de auditoria com cadeia de hashes;
- MFA/TOTP obrigatório em produção;
- CSP/cabeçalhos de segurança;
- backup com AES-256-GCM;
- rotina de minimização/retenção de dados;
- painel admin para configuração, tarifas, termo, pagamento e moderação;
- exportações CSV e ICS com controles de privacidade.

## Android

- `HouseData.kt` recriado;
- preços hardcoded removidos do fluxo móvel;
- avaliações simuladas e indicadores fictícios removidos;
- confirmação falsa de envio de mensagem removida;
- módulo “Guia PB” incluído;
- Guia Vênus sincronizado/cacheado e aberto em WebView restrita;
- download offline via seletor de documentos do Android;
- Auto Backup desabilitado;
- HTTP claro bloqueado e Network Security Config adicionada;
- release com R8/shrink;
- configuração de debug keystore fixa removida;
- URL do portal seguro configurável por `VENUS_BOOKING_URL`.

## Repositório e governança

- `.gitignore` endurecido;
- `SECURITY.md`;
- auditoria formal, modelo de ameaças e deploy seguro;
- workflow CI para backend e Android;
- Gradle version catalog corrigido para `ui-tooling`;
- README reposicionado para arquitetura “Casa + Guia”.
