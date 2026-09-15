import React from 'react';
import {
  Waves,
  Flame,
  Monitor,
  Film,
  Wifi,
  Wind,
  Refrigerator,
  Utensils,
  Car,
  PawPrint,
  Sparkles,
  Sun,
  Tv,
  Coffee,
  CheckCircle,
  Shirt,
} from 'lucide-react';

export const AmenitiesSection: React.FC = () => {
  const amenities = [
    {
      category: 'Lazer e Área Externa',
      items: [
        { name: 'Piscina privativa em L', icon: Waves, desc: 'Perfeita para relaxar e se refrescar a qualquer hora' },
        { name: 'Churrasqueira pré-moldada', icon: Flame, desc: 'Pronta para churrascos e confraternizações' },
        { name: 'Rede nordestina autêntica', icon: Sun, desc: 'Para relaxar sob a brisa na área externa Suave na nave' },
        { name: 'Jardim suspenso', icon: Sparkles, desc: 'Verde e vida decorando o ambiente externo' },
      ],
    },
    {
      category: 'Trabalho, Tecnologia & Sala',
      items: [
        { name: 'Home Office completo', icon: Monitor, desc: 'Mesa retrátil, cadeira ergonômica e suporte para monitor' },
        { name: 'Projetor Smart', icon: Film, desc: 'Cinema em casa na sala com projetor de alta resolução' },
        { name: 'Wi-Fi rápido', icon: Wifi, desc: 'Conexão estável para videochamadas e streaming' },
        { name: 'Sofá bicama de solteiro', icon: Tv, desc: 'Confortável para repouso ou acomodar hóspedes extras' },
      ],
    },
    {
      category: 'Cozinha e Praticidade',
      items: [
        { name: 'Airfryer elétrica', icon: Coffee, desc: 'Fritadeira sem óleo para lanches e refeições rápidas' },
        { name: 'Fogão a gás', icon: Flame, desc: 'Cozinhe suas receitas favoritas com liberdade' },
        { name: 'Geladeira espaçosa', icon: Refrigerator, desc: 'Mantém bebidas geladas e alimentos frescos' },
        { name: 'Utensílios completos', icon: Utensils, desc: 'Panelas, pratos, copos, talheres e recipientes' },
      ],
    },
    {
      category: 'Instalações & Serviços',
      items: [
        { name: 'Garagem privativa', icon: Car, desc: 'Vaga segura para 1 carro de passeio' },
        { name: 'Lavanderia completa', icon: Shirt, desc: 'Tanque para lavar e varal retrátil para secagem' },
        { name: 'Ventiladores potentes', icon: Wind, desc: 'Ambientes frescos nos quartos e áreas sociais' },
        { name: 'Pet Friendly 🐾', icon: PawPrint, desc: 'Seu pet de pequeno/médio porte é super bem-vindo' },
      ],
    },
  ];

  return (
    <section id="comodidades" className="py-10 border-t border-stone-200 scroll-mt-20">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
          Comodidades & Infraestrutura
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
          O que este refúgio oferece
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Equipado com carinho pensando em cada detalhe da sua estadia no litoral sul paraibano.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {amenities.map((category, catIdx) => (
          <div key={catIdx} className="bg-stone-50/60 p-6 rounded-3xl border border-stone-200/70">
            <h3 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200/80">
              {category.category}
            </h3>
            <div className="space-y-4">
              {category.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                return (
                  <div key={itemIdx} className="flex items-start gap-3.5">
                    <div className="p-2 bg-white rounded-xl border border-stone-200/80 text-amber-700 shadow-2xs shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">{item.name}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
