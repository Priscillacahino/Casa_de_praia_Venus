# Atualização para GitHub e revisão jurídica

Este pacote contém o projeto completo e a minuta em Word e texto na pasta docs. Não houve publicação no GitHub nem implantação desta atualização. O termo nasce desativado e os dados bancários nascem vazios. Não cadastre uma aprovação jurídica apenas para liberar reservas reais.

## Instalar ou atualizar

1. Extraia o ZIP. Para versionar no GitHub, envie os arquivos e pastas de dentro de Venus-Beach-House à raiz do repositório, preservando a estrutura. Enviar apenas o ZIP não atualiza o código executável no GitHub.
2. Se já existir uma instalação com dados, faça backup do SQLite antes de atualizar. Preserve `.env`, `data` e `backups`; nunca publique essas pastas ou credenciais.
3. Siga README.md e DEPLOY.md. É necessário servidor Node 24 com disco persistente; GitHub Pages sozinho não executa a API e o banco.
4. Execute `npm ci`, `npm test`, `npm run lint` e `npm run build`. Reinicie o servidor após atualizar todos os arquivos, incluindo a pasta docs.

## Fluxo de operação

- O pedido recebe protocolo e orçamento com sinal de 20%. Continua pendente e não bloqueia datas.
- Em Termos e pagamento, baixe o modelo e encaminhe para revisão jurídica. A versão aprovada deve corresponder ao arquivo `docs/termo-compromisso-minuta.txt`; alterações neste arquivo invalidam a aprovação anterior. Alterar somente o Word não muda o modelo utilizado pelo sistema.
- Após aprovação efetiva, registre responsável e referência do parecer no painel. Preencha os dados da propriedade e todas as lacunas do documento individual antes de gerar o PDF definitivo para assinatura. O HTML individual pode ser aberto, preenchido por um editor e impresso como PDF antes de assinar.
- O hóspede pode assinar o PDF pelo serviço gov.br. Receba o PDF original; anexe-o ao pedido e confira no VALIDAR do ITI. Confira também identidade, conteúdo, valores, horários e correspondência com o pedido. Registre responsável e referência do relatório. O sistema armazena o original e seu SHA-256, mas não valida criptografia automaticamente.
- Cadastre os dados bancários reais quando disponíveis. A área pública só mostra meios de pagamento com os dados necessários e aprovação jurídica registrada. Não existe QR Pix dinâmico, cobrança bancária automática ou consulta à conta Nubank nesta versão.
- Em Financeiro, registre Pix ou transferência apenas depois de conferir o crédito no extrato. Identificador da transação evita lançamento duplicado. Um comprovante enviado pelo hóspede não é confirmação de crédito.
- O botão Confirmar só fica disponível com termo aprovado, assinatura validada e ao menos 20% do total recebido. O servidor também verifica os requisitos e conflitos de datas. A confirmação final é manual.
- Cancelamentos e devoluções financeiras são manuais. O sistema não retém ou devolve dinheiro automaticamente. A política da minuta é 100%, 50% ou 0% exclusivamente do sinal pago, com as exceções legais descritas no texto.

## Revisão jurídica pendente

Verificar o enquadramento da atividade como hospedagem ou locação por temporada, identificação do responsável PF, momento da contratação e reservas próximas ao check-in, regras de uso do imóvel, horários, saldo, assinaturas exigidas e proporcionalidade da retenção. Não há garantia de ausência de contestação. A validação técnica de assinatura não substitui revisão jurídica.

Referências para o jurídico: CDC, especialmente arts. 49 e 51 (https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm); Decreto 7.962/2013 (https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm); assinatura gov.br (https://www.gov.br/governodigital/pt-br/identidade/assinatura-eletronica); VALIDAR (https://validar.iti.gov.br/).

## Dados anteriores e limites

A migração conserva reservas e valores históricos. Pagamentos anteriores ficam sem marca de compensação e não satisfazem o novo bloqueio de confirmação. Se houver pedidos antigos com pagamentos, solicite conciliação e migração técnica desses lançamentos após conferência bancária; não os lance novamente, pois duplicaria o financeiro. Reservas anteriormente confirmadas são preservadas e precisam de revisão operacional separada. Os orçamentos históricos não são reescritos; o novo requisito é 20% do total.

A aplicação mobile é PWA instalável pelo navegador; não é APK nem publicação em lojas. WhatsApp funciona por link; agenda Google por importação ICS, sem sincronização. CSV calcula valores por reserva, não substitui contabilidade. Testes automatizados de API, cálculo, bloqueios e backup passaram. Não houve teste visual em celular real nem implantação no provedor nesta atualização.
