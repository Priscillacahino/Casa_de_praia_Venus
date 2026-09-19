# Vênus Beach House — v2.2.0 / Bloco 3

Este bloco fecha lacunas internas de pré-produção sem depender de terceiros.

## Implementações

- preflight centralizado para configuração de produção;
- startup recusa HTTPS ausente, segredos frágeis, banco não persistente, chave de backup inválida e Guia sem SHA-256;
- novo `production:check` somente leitura;
- verificação de integridade do SQLite e de chaves estrangeiras;
- exigência de schema mínimo `user_version 6`;
- restauração de backup atômica;
- restore recusa sobrescrita acidental;
- arquivo restaurado só é publicado após validação de integridade;
- lint estrutural cobre os novos arquivos críticos.

## Limites externos preservados

Ainda são necessários revisão jurídica, conciliação bancária real, HTTPS/secret manager do provedor e homologação ponta a ponta no ambiente definitivo.
