import React from "react";
import { useService } from "../service";
export function MapSection() {
  const { data } = useService();
  return (
    <section id="localizacao" className="py-10 border-t space-y-4">
      <h2 className="section-title">Localização</h2>
      <p>
        Conde, litoral sul da Paraíba. Consulte o ponto da propriedade e trace
        sua rota no Google Maps.
      </p>
      {data?.settings.mapsEmbedUrl && (
        <iframe
          title="Localização da Vênus Beach House"
          src={data.settings.mapsEmbedUrl}
          className="w-full h-80 rounded-2xl border"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}
      {data && (
        <a
          className="action"
          target="_blank"
          rel="noreferrer"
          href={data.settings.googleMapsUrl}
        >
          Abrir localização no Google Maps
        </a>
      )}
    </section>
  );
}
