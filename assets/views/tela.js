import { render as base } from '../crud.js';

const CONFIG = {
  "titulo": "Estabelecimentos",
  "tabela": "arm_lojas",
  "modulo": "estabelecimento",
  "singular": "estabelecimento",
  "ordem": "nome",
  "filtro": "Nome, CNPJ ou cidade",
  "colunas": [
    { "campo": "nome", "rotulo": "Razão social" },
    { "campo": "cnpj_cpf", "rotulo": "CNPJ/CPF", "classe": "mono" },
    { "campo": "cidade", "rotulo": "Cidade" },
    { "campo": "whatsapp", "rotulo": "WhatsApp" },
    { "campo": "ativa", "rotulo": "Ativo" }
  ],
  "campos": [
    { "campo": "nome", "rotulo": "Razão social", "obrigatorio": true },
    { "campo": "nome_fantasia", "rotulo": "Nome fantasia" },
    { "campo": "cnpj_cpf", "rotulo": "CNPJ/CPF" },
    { "campo": "contato_nome", "rotulo": "Contato" },
    { "campo": "email", "rotulo": "E-mail", "tipo": "email" },
    { "campo": "whatsapp", "rotulo": "WhatsApp" },
    { "campo": "cidade", "rotulo": "Cidade" },
    { "campo": "estado", "rotulo": "Estado" },
    { "campo": "ativa", "rotulo": "Ativo", "tipo": "check" }
  ]
};

export function render(raiz, ctx) {
  return base(raiz, ctx, CONFIG);
}
