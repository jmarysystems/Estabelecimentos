import { render as base } from '../crud.js';

const CONFIG = {
  "titulo": "Estabelecimentos",
  "tabela": "arm_lojas",
  "modulo": "estabelecimento",
  "singular": "estabelecimento",
  "ordem": "nome",
  "filtro": "Nome, CNPJ ou cidade",
  "cep": true,
  "cnpj": true,
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
    { "campo": "codigo", "rotulo": "Código" },
    { "campo": "ativa", "rotulo": "Ativo", "tipo": "check" },

    { "campo": "regime_tributario", "rotulo": "Regime tributário", "aba": "Fiscal",
      "tipo": "opcoes", "vazio": "Selecione",
      "opcoes": [
        { "valor": "", "rotulo": "Selecione" },
        { "valor": "0 - Simples Nacional", "rotulo": "0 - Simples Nacional" },
        { "valor": "1 - Lucro Real", "rotulo": "1 - Lucro Real" },
        { "valor": "2 - Lucro Presumido", "rotulo": "2 - Lucro Presumido" },
        { "valor": "3 - Simples Nacional - excesso de sublimite", "rotulo": "3 - Simples Nacional - excesso de sublimite" }
      ] },
    { "campo": "cnae_principal", "rotulo": "CNAE principal", "aba": "Fiscal" },
    { "campo": "cnae_descricao", "rotulo": "Descrição do CNAE", "aba": "Fiscal" },
    { "campo": "certificado", "rotulo": "Certificado digital (.pfx / .p12)", "aba": "Fiscal",
      "tipo": "arquivo", "bucket": "certificados",
      "colunas": { "nome": "certificado_nome", "caminho": "certificado_caminho",
                   "enviado": "certificado_enviado_em" } },

    { "campo": "cep", "rotulo": "CEP", "aba": "Localização" },
    { "campo": "nome_endereco", "rotulo": "Nome da rua / avenida", "aba": "Localização" },
    { "campo": "numero", "rotulo": "Número", "aba": "Localização" },
    { "campo": "apartamento", "rotulo": "Apartamento", "aba": "Localização" },
    { "campo": "bloco", "rotulo": "Bloco", "aba": "Localização" },
    { "campo": "bairro", "rotulo": "Nome bairro", "aba": "Localização" },
    { "campo": "complemento", "rotulo": "Complemento", "aba": "Localização" },
    { "campo": "sigla_pais", "rotulo": "Sigla país", "aba": "Localização" },
    { "campo": "codigo_ibge_pais", "rotulo": "Código IBGE país", "aba": "Localização" },
    { "campo": "nome_pais", "rotulo": "Nome país", "aba": "Localização" },
    { "campo": "sigla_estado", "rotulo": "Sigla estado", "aba": "Localização" },
    { "campo": "codigo_ibge_estado", "rotulo": "Código IBGE estado", "aba": "Localização" },
    { "campo": "estado", "rotulo": "Nome estado", "aba": "Localização" },
    { "campo": "codigo_ibge_municipio", "rotulo": "Código IBGE município", "aba": "Localização" },
    { "campo": "cidade", "rotulo": "Nome município", "aba": "Localização" },
    { "campo": "latitude", "rotulo": "Latitude", "aba": "Localização" },
    { "campo": "longitude", "rotulo": "Longitude", "aba": "Localização" }
  ]
};

export function render(raiz, ctx) {
  return base(raiz, ctx, CONFIG);
}
