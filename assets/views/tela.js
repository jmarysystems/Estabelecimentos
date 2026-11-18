import { render as base } from '../crud.js';

const CONFIG = {
  "titulo": "Estabelecimentos",
  "tabela": "arm_lojas",
  "modulo": "estabelecimento",
  "singular": "estabelecimento",
  "ordem": "nome",
  "filtro": "Nome ou código",
  "colunas": [
    { "campo": "nome", "rotulo": "Nome" },
    { "campo": "codigo", "rotulo": "Código", "classe": "mono" },
    { "campo": "ativa", "rotulo": "Ativo" }
  ],
  "campos": [
    { "campo": "nome", "rotulo": "Nome", "obrigatorio": true },
    { "campo": "codigo", "rotulo": "Código" },
    { "campo": "ativa", "rotulo": "Ativo", "tipo": "check" }
  ]
};

export function render(raiz, ctx) {
  return base(raiz, ctx, CONFIG);
}
