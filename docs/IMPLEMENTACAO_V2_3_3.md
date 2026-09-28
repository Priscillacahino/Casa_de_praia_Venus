# Implementação v2.3.3 — contato, termo GOV.BR e política de reserva

Esta revisão mantém o hardening da v2.3.2 e aplica:

- logotipo da Vênus no canto superior esquerdo;
- WhatsApp e Instagram com acesso direto e destacado;
- área de contato inspirada na referência visual do AI Studio;
- remoção da informação incorreta de cascata;
- textos dos cômodos e emojis preservados;
- abertura da home com a mensagem e lista de praias definidas;
- sinal operacional de 20% e saldo de 80% no check-in;
- cancelamento: 48h ou mais = 100% do sinal; de 24h a menos de 48h = 50%; menos de 24h = 0%, sem estorno automático;
- termo de compromisso antes do pagamento;
- fluxo manual seguro de assinatura GOV.BR: preparar PDF, assinar no serviço oficial, enviar PDF, validar no painel e só então liberar o WhatsApp de pagamento;
- dados bancários continuam fora do site público;
- Guia Vênus permanece integrado.

A alteração do termo muda `TERM_HASH`; a nova versão precisa ser aprovada novamente no painel antes de liberar contratação e pagamento.

O termo continua sendo minuta técnica do projeto e deve passar pela revisão jurídica prevista no production gate antes de uso comercial real.
