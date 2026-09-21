# Distribuição direta do aplicativo Android

A Vênus Beach House não depende da Google Play para distribuir o aplicativo. O modelo previsto é **Instagram oficial → página HTTPS da casa → botão de download do APK oficial**.

## Regras de segurança

- nunca publicar APK de debug;
- assinar o release com keystore mantida fora do Git e da pasta pública;
- publicar o SHA-256 do APK ao lado do download;
- manter uma única URL oficial de download na página da casa;
- não distribuir APK por mensagens, grupos ou anexos;
- fixar no build distribuído a URL HTTPS da reserva e o SHA-256 do Guia Vênus.

## Geração do release

Configure temporariamente no computador de release: `VENUS_BOOKING_URL`, `VENUS_GUIDE_SHA256`, `VENUS_KEYSTORE_PATH`, `VENUS_KEYSTORE_PASSWORD`, `VENUS_KEY_ALIAS` e `VENUS_KEY_PASSWORD`.

Execute `npm.cmd run android:release-check` antes do build. Depois gere o APK release com Gradle. As credenciais de assinatura nunca devem entrar no repositório.

Após gerar o APK assinado, calcule o SHA-256, hospede o arquivo em URL HTTPS estável e preencha URL, versão e SHA-256 no painel administrativo. O botão público só aparece quando os três campos estão configurados juntos.
