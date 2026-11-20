// Tela genérica de cadastro: lista, filtro, abas, formulário e exclusão.
import { sb, listar, criar, atualizar, excluir } from './api.js';
import * as ui from './ui.js';

const rotuloDe = (listas, de, id) => {
  if (!de || !id) return '—';
  const itens = listas[de.tabela] || [];
  const achado = itens.find((x) => x.id === id);
  return achado ? achado[de.rotulo] : '—';
};

const UFS = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará',
  PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

export async function render(raiz, ctx, cfg) {
  ctx.setTitulo(cfg.titulo);

  const podeCriar = ctx.pode(cfg.modulo, 'cadastrar');
  const podeEditar = ctx.pode(cfg.modulo, 'editar');
  const podeExcluir = ctx.pode(cfg.modulo, 'excluir');

  const listas = {};
  for (const campo of cfg.campos) {
    if (campo.de && !listas[campo.de.tabela]) {
      listas[campo.de.tabela] = await listar(campo.de.tabela, { ordem: campo.de.rotulo });
    }
  }

  const dados = await listar(cfg.tabela, { select: cfg.select || '*', ordem: cfg.ordem });

  function tabela() {
    if (!dados.length) return ui.vazio(cfg.vazio || 'Nenhum registro cadastrado.');
    return `
      <div class="tabela-rolagem"><table>
        <thead><tr>${cfg.colunas.map((c) => `<th>${ui.esc(c.rotulo)}</th>`).join('')}<th></th></tr></thead>
        <tbody>
          ${dados.map((d) => `<tr data-busca="${ui.esc(JSON.stringify(d).toLowerCase())}">
            ${cfg.colunas.map((c) => `<td class="${c.classe || ''}">${
              c.de ? ui.esc(rotuloDe(listas, c.de, d[c.campo]))
                   : ui.esc(d[c.campo] ?? '—')}</td>`).join('')}
            <td class="acoes">
              ${podeEditar ? `<button type="button" class="botao-pequeno" data-editar="${ui.esc(d.id)}">Editar</button>` : ''}
              ${podeExcluir ? `<button type="button" class="botao-pequeno botao-perigo" data-excluir="${ui.esc(d.id)}">Excluir</button>` : ''}
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>`;
  }

  raiz.innerHTML = `
    <div class="cartao">
      <div class="cartao-topo">
        <h2>${dados.length} ${ui.esc(cfg.singular || 'registro')}(s)</h2>
        ${podeCriar ? `<div class="linha-acoes">
          <button type="button" class="botao-primario" id="novo">Novo ${ui.esc(cfg.singular || 'registro')}</button>
        </div>` : ''}
      </div>
      <label class="campo" style="max-width:340px"><span>Filtrar</span>
        <input type="search" id="filtro" placeholder="${ui.esc(cfg.filtro || 'Digite para filtrar')}"></label>
      <div id="lista">${tabela()}</div>
    </div>`;

  const filtro = raiz.querySelector('#filtro');
  filtro.addEventListener('input', () => {
    const t = filtro.value.toLowerCase();
    for (const tr of raiz.querySelectorAll('#lista tbody tr')) {
      tr.hidden = !!t && !tr.dataset.busca.includes(t);
    }
  });

  function htmlCampo(c, registro) {
    const valor = registro[c.campo] ?? '';
    if (c.tipo === 'select') {
      const itens = listas[c.de.tabela] || [];
      return `<label class="campo"><span>${ui.esc(c.rotulo)}${c.obrigatorio ? ' *' : ''}</span>
        <select name="${ui.esc(c.campo)}" ${c.obrigatorio ? 'required' : ''}>
          <option value="">—</option>
          ${itens.map((i) => `<option value="${ui.esc(i.id)}" ${
            i.id === valor ? 'selected' : ''}>${ui.esc(i[c.de.rotulo])}</option>`).join('')}
        </select></label>`;
    }
    if (c.tipo === 'arquivo') {
      const atual = registro[c.colunas?.nome || c.campo];
      return `<label class="campo"><span>${ui.esc(c.rotulo)}${c.obrigatorio ? ' *' : ''}</span>
        <input type="file" name="${ui.esc(c.campo)}" data-arquivo="${ui.esc(c.campo)}">
        <small class="sub">${atual ? `Arquivo atual: ${ui.esc(atual)}` : 'Nenhum arquivo enviado'}</small>
      </label>`;
    }
    if (c.tipo === 'check') {
      return `<label class="campo"><span>${ui.esc(c.rotulo)}</span>
        <input type="checkbox" name="${ui.esc(c.campo)}" ${valor ? 'checked' : ''}></label>`;
    }
    if (c.tipo === 'opcoes') {
      return `<label class="campo"><span>${ui.esc(c.rotulo)}${c.obrigatorio ? ' *' : ''}</span>
        <select name="${ui.esc(c.campo)}" ${c.obrigatorio ? 'required' : ''}>
          ${c.opcoes.map((o) => `<option value="${ui.esc(o.valor)}" ${
            o.valor === valor ? 'selected' : ''}>${ui.esc(o.rotulo)}</option>`).join('')}
        </select></label>`;
    }
    return ui.campoTexto(c.rotulo, c.campo, valor, {
      obrigatorio: c.obrigatorio,
      tipo: c.tipo === 'numero' ? 'number' : c.tipo === 'email' ? 'email' : 'text',
    });
  }

  function abrirFormulario(registro) {
    const editando = !!registro.id;

    const abas = [];
    for (const c of cfg.campos) {
      const nome = c.aba || 'Dados';
      if (!abas.includes(nome)) abas.push(nome);
    }

    const paineis = abas.map((aba, indice) => {
      const campos = cfg.campos.filter((c) => (c.aba || 'Dados') === aba);
      const temCep = cfg.cep && campos.some((c) => c.campo === 'cep');
      const temCnpj = cfg.cnpj && campos.some((c) => c.campo === 'cnpj_cpf');
      const botoes = [];
      if (temCnpj) botoes.push('<button type="button" class="botao-pequeno" id="busca-cnpj">'
        + '🏢 Buscar dados pelo CNPJ</button><span class="sub" id="cnpj-info"></span>');
      if (temCep) botoes.push('<button type="button" class="botao-pequeno" id="busca-cep">'
        + '🔎 Pesquisar endereço</button><span class="sub" id="cep-info"></span>');
      const buscaCep = botoes.length
        ? '<div class="linha-acoes" style="margin-bottom:12px;flex-wrap:wrap">'
          + botoes.join('') + '</div>'
        : '';
      return `<section data-painel="${ui.esc(aba)}" ${indice === 0 ? '' : 'hidden'}>
        ${buscaCep}
        <div class="grade grade-2">${campos.map((c) => htmlCampo(c, registro)).join('')}</div>
      </section>`;
    }).join('');

    const abasHtml = abas.length > 1
      ? `<div class="abas">${abas.map((aba, i) => `
          <button type="button" class="aba ${i === 0 ? 'ativa' : ''}" data-aba="${ui.esc(aba)}">
            ${ui.esc(aba)}</button>`).join('')}</div>`
      : '';

    const { fechar, corpo } = ui.modal({
      titulo: `${editando ? 'Editar' : 'Novo'} ${cfg.singular || 'registro'}`,
      largura: '820px',
      corpo: `
        <form id="form">
          ${abasHtml}
          ${paineis}
          <div class="linha-acoes" style="margin-top:16px">
            <button type="submit" class="botao-primario">${editando ? 'Salvar' : 'Cadastrar'}</button>
            <button type="button" id="cancelar">Cancelar</button>
          </div>
        </form>`,
    });

    for (const b of corpo.querySelectorAll('[data-aba]')) {
      b.addEventListener('click', () => {
        const alvo = b.dataset.aba;
        for (const x of corpo.querySelectorAll('[data-aba]')) {
          x.classList.toggle('ativa', x === b);
        }
        for (const p of corpo.querySelectorAll('[data-painel]')) {
          p.hidden = p.dataset.painel !== alvo;
        }
      });
    }

    const campo = (nome) => corpo.querySelector(`[name="${nome}"]`);
    const preencher = (nome, valor) => {
      const el = campo(nome);
      if (el && valor !== undefined && valor !== null && valor !== '') el.value = valor;
    };

    async function buscarCep() {
      const bruto = (campo('cep')?.value || '').replace(/\D/g, '');
      const info = corpo.querySelector('#cep-info');
      if (bruto.length !== 8) {
        ui.toast('Informe um CEP com 8 dígitos.', 'erro');
        return;
      }
      if (info) info.textContent = 'Consultando…';

      try {
        const resp = await fetch(`https://viacep.com.br/ws/${bruto}/json/`);
        const d = await resp.json();
        if (d.erro) {
          if (info) info.textContent = 'CEP não encontrado.';
          return;
        }
        preencher('cep', d.cep);
        preencher('sigla_estado', d.uf);
        preencher('estado', UFS[d.uf] || d.uf);
        preencher('cidade', d.localidade);
        preencher('bairro', d.bairro);
        preencher('complemento', d.complemento);
        preencher('codigo_ibge_municipio', d.ibge);
        if (d.ibge) preencher('codigo_ibge_estado', String(d.ibge).slice(0, 2));
        preencher('nome_endereco', d.logradouro);

        try {
          const r2 = await fetch(`https://brasilapi.com.br/api/cep/v2/${bruto}`);
          const d2 = await r2.json();
          const coord = d2?.location?.coordinates;
          if (coord) {
            preencher('latitude', coord.latitude);
            preencher('longitude', coord.longitude);
          }
          if (d2.state) preencher('sigla_estado', d2.state);
        } catch (_) { /* segue para o próximo serviço */ }

        // se ainda não temos coordenadas, tenta o OpenStreetMap
        try {
          if (!campo('latitude')?.value) {
            const endereco = [d.logradouro, d.bairro, d.localidade, d.uf, 'Brasil']
              .filter(Boolean).join(', ');
            const r3 = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='
              + encodeURIComponent(endereco));
            const lista = await r3.json();
            if (lista && lista.length) {
              preencher('latitude', Number(lista[0].lat).toFixed(6));
              preencher('longitude', Number(lista[0].lon).toFixed(6));
            }
          }
        } catch (_) { /* coordenadas são opcionais */ }

        if (info) info.textContent = `${d.localidade}/${d.uf} — preenchido pelo CEP.`;
        ui.toast('Endereço preenchido.');
      } catch (erro) {
        if (info) info.textContent = 'Não foi possível consultar o CEP.';
      }
    }

    async function buscarCnpj() {
      const bruto = (campo('cnpj_cpf')?.value || '').replace(/\D/g, '');
      const info = corpo.querySelector('#cnpj-info');
      if (bruto.length !== 14) {
        ui.toast('Informe um CNPJ com 14 dígitos.', 'erro');
        return;
      }
      if (info) info.textContent = 'Consultando…';

      try {
        const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${bruto}`);
        if (!resp.ok) throw new Error('CNPJ não encontrado.');
        const d = await resp.json();

        preencher('razao_social', d.razao_social);
        preencher('nome_fantasia', d.nome_fantasia);
        preencher('cep', d.cep ? String(d.cep).replace(/^(\d{5})(\d{3})$/, '$1-$2') : null);
        preencher('nome_endereco',
          [d.descricao_tipo_de_logradouro, d.logradouro].filter(Boolean).join(' '));
        preencher('numero', d.numero);
        preencher('complemento', d.complemento);
        preencher('bairro', d.bairro);
        preencher('cidade', d.municipio);
        preencher('estado', UFS[d.uf] || d.uf);
        preencher('sigla_estado', d.uf);
        preencher('codigo_ibge_municipio', d.codigo_municipio_ibge);
        preencher('sigla_pais', 'BR');
        preencher('codigo_ibge_pais', '76');
        preencher('nome_pais', 'Brasil');
        preencher('pais', 'Brasil');
        if (d.cnae_fiscal) preencher('cnae_principal', String(d.cnae_fiscal));
        preencher('cnae_descricao', d.cnae_fiscal_descricao);
        if (d.opcao_pelo_simples) preencher('regime_tributario', '0 - Simples Nacional');

        if (info) info.textContent = `${d.razao_social || ''} — preenchido pelo CNPJ.`;
        ui.toast('Dados do CNPJ preenchidos.');
      } catch (erro) {
        if (info) info.textContent = 'Não foi possível consultar o CNPJ.';
        ui.toast(erro.message, 'erro');
      }
    }

    corpo.querySelector('#busca-cnpj')?.addEventListener('click', buscarCnpj);
    corpo.querySelector('#busca-cep')?.addEventListener('click', buscarCep);

    corpo.querySelector('#cancelar').addEventListener('click', fechar);
    corpo.querySelector('#form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const d = ui.dadosDoForm(ev.target);
      const valores = {};
      const numericos = ['latitude', 'longitude'];

      for (const c of cfg.campos) {
        if (c.tipo === 'check') {
          valores[c.campo] = !!ev.target.querySelector(`[name="${c.campo}"]`).checked;
        } else if (c.tipo === 'numero' || numericos.includes(c.campo)) {
          valores[c.campo] = d[c.campo] ? Number(String(d[c.campo]).replace(',', '.')) : null;
        } else {
          valores[c.campo] = d[c.campo] || null;
        }
        if (c.obrigatorio && (valores[c.campo] === null || valores[c.campo] === '')) {
          ui.toast(`Informe ${c.rotulo}.`, 'erro');
          return;
        }
      }

      try {
        let salvo;
        if (editando) salvo = await atualizar(cfg.tabela, registro.id, valores);
        else salvo = await criar(cfg.tabela, { ...valores, ...(cfg.extra || {}) });

        // upload de arquivos (ex.: certificado digital)
        for (const c of cfg.campos) {
          if (c.tipo !== 'arquivo') continue;
          const input = ev.target.querySelector(`[name="${c.campo}"]`);
          const arquivo = input && input.files && input.files[0];
          if (!arquivo) continue;

          const caminho = `${salvo.id}/${Date.now()}_${arquivo.name.replace(/[^\w.\-]/g, '_')}`;
          const { error: erroUp } = await sb.storage.from(c.bucket || 'certificados')
            .upload(caminho, arquivo, { upsert: true });
          if (erroUp) throw new Error(erroUp.message);

          await atualizar(cfg.tabela, salvo.id, {
            [c.colunas?.nome || 'certificado_nome']: arquivo.name,
            [c.colunas?.caminho || 'certificado_caminho']: caminho,
            [c.colunas?.enviado || 'certificado_enviado_em']: new Date().toISOString(),
          });
        }

        fechar();
        ui.toast(editando ? 'Registro atualizado.' : 'Registro cadastrado.');
        ctx.recarregar();
      } catch (erro) {
        ui.toast(erro.message, 'erro');
      }
    });
  }

  raiz.querySelector('#novo')?.addEventListener('click', () => abrirFormulario({}));

  for (const b of raiz.querySelectorAll('[data-editar]')) {
    b.addEventListener('click', () => abrirFormulario(dados.find((d) => d.id === b.dataset.editar) || {}));
  }
  for (const b of raiz.querySelectorAll('[data-excluir]')) {
    b.addEventListener('click', async () => {
      if (!window.confirm('Excluir este registro?')) return;
      try {
        await excluir(cfg.tabela, b.dataset.excluir);
        ui.toast('Registro excluído.');
        ctx.recarregar();
      } catch (erro) { ui.toast(erro.message, 'erro'); }
    });
  }
}
