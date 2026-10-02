# Hardening pré-produção — Casa de Praia Vênus

## Escopo

Este bloco prepara três pontos antes da operação com dados e dinheiro reais:

1. conferência administrativa do sinal externo;
2. proteção do CPF em repouso;
3. retirada segura do legado financeiro interno.

## Sinal conferido externamente

O pagamento continua fora do site. O banco armazena somente:
- protocolo da reserva;
- data/hora da conferência;
- ator administrativo (`admin`).

Não são armazenados comprovante, Pix, banco, método, referência, valor recebido nem transação. A confirmação da reserva passa a exigir termo juridicamente liberado, assinatura validada, sinal conferido externamente e datas livres.

## CPF

Novos CPFs são protegidos com AES-256-GCM antes de serem gravados na coluna `reservations.cpf`. Em produção, a chave independente `PII_ENCRYPTION_KEY` é obrigatória e deve ficar no secret manager.

Bancos anteriores devem ser migrados explicitamente com:

```
npm run privacy:migrate-cpf
```

O script não imprime CPFs. O preflight de produção rejeita registros ainda em texto simples.

## Legado financeiro

Bancos novos não criam mais as tabelas `payments` e `banking`.

Para bancos antigos:
- `npm run legacy-finance:audit` informa somente presença/contagem;
- `npm run legacy-finance:cleanup-empty` remove somente tabelas vazias/sem configuração;
- se houver registros ou configuração bancária, a limpeza interrompe sem apagar dados.

## Schema

`PRAGMA user_version = 10`.

## Fora do escopo

Este bloco não:
- processa pagamento;
- armazena comprovante;
- valida juridicamente o termo;
- gera ou publica segredos de produção;
- apaga histórico financeiro não vazio;
- substitui revisão jurídica, contábil ou de segurança independente.
