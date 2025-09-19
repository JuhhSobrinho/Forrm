document.addEventListener("DOMContentLoaded", () => {
  const dados = JSON.parse(localStorage.getItem("dadosRelatorio"));
  if (!dados) {
    alert("Dados não encontrados.");
    return;
  }

  // Preencher tabela de materiais (assumindo array de arrays)
  if (Array.isArray(dados.materiais)) { // Seleciona todas as linhas das duas tabelas de materiais 
    const linhas = document.querySelectorAll(".tabela-dados-material tbody tr");

    dados.materiais.forEach((mat, i) => {
      if (linhas[i]) {
        const linha = linhas[i];
        const tdItem = linha.querySelector(".item");
        const tdQtd = linha.querySelector(".quantidade");
        const tdDesc = linha.querySelector(".descricao-material");

        if (tdItem) tdItem.textContent = mat[0] || "";
        if (tdQtd) tdQtd.textContent = mat[1] || "";
        if (tdDesc) tdDesc.textContent = mat[2] || "";
      }
    });
  }


  const setInputValue = (id, value) => {
    const el = document.getElementById(id);
    if (el && "value" in el) el.value = value || "";
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  };

  setText("tituloRde", "N°" + dados.nrde);
  setInputValue("cliente", dados.cliente);
  setInputValue("local", dados.local);
  setInputValue("data", dados.data);
  setInputValue("osTeam", dados.osTeam);

  setText("diametro", dados.diametro + '"');
  setText("tag", dados.tag);
  setText("material", dados.material);
  setText("fluido", dados.fluido);
  setText("comprimento", dados.comprimento);

  setText("comprimentoPFP", dados.comprimentoPFP);
  setText("furoNaLinha", dados.furoNaLinha);

  setText("pressaoProjeto", dados.pressaoProjeto);
  setText("temperaturaProjeto", dados.temperaturaProjeto + "°C");
  setText("pressaoOperacao", dados.pressaoOperacao);
  setText("temperaturaOperacao", dados.temperaturaOperacao + "°C");
  setText("numeroCamadas", dados.camadas);

  setText("ssCliente", dados.ssCliente);
  setText("numeroOM", dados.numeroOM);

  setText("temperaturaAmbiente", dados.temperaturaAmbiente + "°C");
  setText("temperaturaSuperficie", dados.temperaturaSuperficie + "°C");
  setText("rugosidadeSuperficie", dados.rugosidadeSuperficie);
  setText("temperaturaPontoOrvalho", dados.temperaturaOrvalho + "°C");
  setText("umidadeRelativa", dados.umidadeRelativa + "%");
  setText("espessuraReparo", dados.espessuraReparo + "mm");
  setText("resumoAtividades", dados.descricao);

  // Marcar checkboxes tiposReparo
  if (Array.isArray(dados.tiposReparo)) {
    const checkboxes = document.querySelectorAll('input[name="tipoReparo"]');
    checkboxes.forEach(cb => {
      cb.checked = dados.tiposReparo.includes(cb.value);
    });
  }

  // Marcar checkboxes geometriaReparo
  if (Array.isArray(dados.geometriaReparo)) {
    const checkboxesGeo = document.querySelectorAll('#geometriaReparo input[type="checkbox"]');
    checkboxesGeo.forEach(cb => {
      cb.checked = dados.geometriaReparo.includes(cb.value);
    });
  }

  const setImage = (id, src) => {
    const img = document.getElementById(id);
    if (img && src) img.src = src;
  };

  setImage("fotoAntes", dados.fotoAntesBase64);
  setImage("fotoDepois", dados.fotoDepoisBase64);
  setImage("fotoAposPfp", dados.fotoAntesPfpBase64);


  window.print();

});
