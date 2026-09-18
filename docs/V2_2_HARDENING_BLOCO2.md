# Vênus Beach House — v2.2.0 / Bloco 2

Este bloco aprofunda rastreabilidade operacional e confiabilidade sem depender de serviços externos.

## Implementações

- avaliações públicas passam a exigir reserva real, código privado válido, status confirmado e check-out encerrado;
- uma estadia só pode gerar uma avaliação;
- nome da avaliação vem da própria reserva, evitando autoria autodeclarada;
- código privado de acompanhamento ganha rotação controlada pela administração;
- versão 1 dos códigos existentes continua compatível até que haja rotação;
- painel administrativo recebe conciliação financeira server-side;
- entradas, estornos, líquido, saldo confirmado e valores retidos em reservas canceladas ficam separados;
- exportação CSV específica de conciliação;
- pagamentos e estornos geram eventos distintos na trilha de reserva e na auditoria;
- schema interno atualizado para user_version 6.

## Limites que permanecem

- rotação do código não é recuperação automática: o novo código precisa ser comunicado ao hóspede por canal confiável;
- a conciliação continua dependente da conferência humana do extrato bancário;
- revisão jurídica, HTTPS real, secret manager e homologação em infraestrutura final continuam como gates externos;
- avaliações legadas sem vínculo de reserva permanecem identificadas como legadas no painel.
