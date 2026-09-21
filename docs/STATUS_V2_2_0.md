# Estado consolidado — Vênus Beach House v2.2.0

A release **v2.2.0** consolida três blocos de endurecimento técnico e deve ser tratada como uma base de **pré-produção pronta para homologação**, não como liberação automática para operação comercial real.

## Controles já incorporados

- valores financeiros em centavos e cálculo autoritativo no servidor;
- percentual de sinal configurável;
- idempotência e prevenção de sobreposição de reservas;
- prioridade temporária de datas e fila para concorrência;
- código privado de acompanhamento com rotação administrativa;
- avaliações vinculadas a reservas confirmadas e encerradas;
- conciliação operacional de pagamentos e estornos;
- referência bancária única;
- painel financeiro e exportação CSV;
- autenticação administrativa com scrypt + TOTP;
- sessão HttpOnly/SameSite e proteções de origem;
- rate limiting persistido no SQLite para operação de instância única;
- trilha de auditoria encadeada por hash;
- backup AES-256-GCM;
- restauração atômica com `PRAGMA integrity_check` e `PRAGMA foreign_key_check`;
- preflight de produção;
- `production:check` somente leitura;
- exigência de HTTPS, segredos mínimos, banco persistente e hash do Guia em produção;
- integração do Guia Vênus com `GUIDE_EXPECTED_SHA256`;
- build Android e backend validados no CI;
- branch `main` protegida com checks obrigatórios;
- compatibilidade de caminhos no Windows corrigida no servidor de arquivos estáticos;
- interface web validada localmente em Windows e acessada por celular na mesma rede;
- galeria responsiva de ambientes e controles PWA preparados sem dependências externas.

## Observação sobre a auditoria de 18/09/2026

O arquivo `docs/AUDITORIA_RIGOROSA_2026-09-18.md` registra uma fotografia histórica do estágio da aplicação naquela data. Alguns riscos ali descritos foram tratados depois, durante a v2.2.0, especialmente:

- o rate limiting deixou de ser apenas em memória e passou a ser persistido no SQLite;
- o Guia passou a exigir SHA-256 em produção;
- o build Android passou a ser executado e aprovado no CI;
- o percentual de sinal deixou de ser tratado como um valor fixo de 20%.

Por isso, este documento deve ser usado como referência de estado atual da v2.2.0.

## Limites atuais

Ainda dependem de ambiente, teste ou validação externa:

- domínio HTTPS definitivo;
- volume persistente e protegido;
- secret manager do provedor;
- configuração dos segredos reais;
- revisão jurídica da versão exata do termo;
- conferência dos dados bancários reais;
- conciliação/reembolso com transações controladas;
- APK release assinado com keystore de produção;
- teste em aparelho real;
- testes ponta a ponta em homologação;
- revisão independente de segurança antes de aumento relevante do volume financeiro;
- arquitetura compartilhada de rate limiting se houver múltiplas réplicas.

A passagem de pré-produção para homologação deve seguir `docs/HOMOLOGACAO_V2_2.md`.
