# Avanço autônomo local — 19/09/2026

Este lote reúne melhorias preparadas sem depender de domínio público, hospedagem, instituição financeira, jurídico, dados bancários reais ou serviços externos.

## Implementado

- galeria mobile com seis ambientes da casa;
- ampliação de fotos em `dialog` com navegação por teclado;
- carregamento preguiçoso das miniaturas;
- curadoria de imagens distintas para evitar apresentar duplicatas como cômodos diferentes;
- inventário SHA-256 de imagens duplicadas, sem exclusão automática;
- atalhos PWA para ambientes, reserva e Guia Vênus;
- revisão da página offline;
- atributos de acessibilidade em mensagens dinâmicas;
- regras `.gitattributes` e `.editorconfig`;
- guarda automática contra sequências comuns de corrupção UTF-8;
- testes de regressão para galeria, manifesto PWA, imagens, encoding e correção Windows;
- atualização do README, status e roteiro de homologação.

## Deliberadamente não alterado

- valores, tarifas e regras financeiras;
- dados bancários;
- aprovação jurídica;
- segredos e credenciais;
- endereço HTTPS definitivo;
- assinatura de produção do Android;
- configurações de infraestrutura externa.

## Próximos bloqueios reais

Os itens restantes que exigem evidência prática ou terceiros continuam no roteiro `docs/HOMOLOGACAO_V2_2.md`: HTTPS definitivo, E2E da reserva/administração, dispositivo Android real, assinatura release, revisão jurídica, dados bancários e revisão independente de segurança.
