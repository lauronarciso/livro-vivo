// SisGAP-ES — dados do protótipo
// Ações e indicadores específicos extraídos dos planos de manejo (fonte e página indicadas).
// Valores numéricos, responsáveis e status são SIMULADOS para validação.

const UCS = [
  {s:"PECF",n:"Parque Estadual Cachoeira da Fumaça",cat:"Parque",g:"PI"},
  {s:"PEFG",n:"Parque Estadual Forno Grande",cat:"Parque",g:"PI",piloto:true},
  {s:"PEI",n:"Parque Estadual de Itaúnas",cat:"Parque",g:"PI",piloto:true},
  {s:"PEMF",n:"Parque Estadual Mata das Flores",cat:"Parque",g:"PI"},
  {s:"PEPCV",n:"Parque Estadual Paulo César Vinha",cat:"Parque",g:"PI"},
  {s:"PEPAZ",n:"Parque Estadual da Pedra Azul",cat:"Parque",g:"PI"},
  {s:"PESA",n:"Parque Estadual — PESA",cat:"Parque",g:"PI"},
  {s:"MONAFF",n:"Monumento Natural O Frade e a Freira",cat:"Monumento Natural",g:"PI"},
  {s:"MONAST",n:"Monumento Natural Serra das Torres",cat:"Monumento Natural",g:"PI"},
  {s:"MONACP",n:"Monumento Natural — MONACP",cat:"Monumento Natural",g:"PI"},
  {s:"REBIODB",n:"Reserva Biológica de Duas Bocas",cat:"Reserva Biológica",g:"PI"},
  {s:"APACB",n:"APA de Conceição da Barra",cat:"APA",g:"US"},
  {s:"APASE",n:"APA de Setiba",cat:"APA",g:"US"},
  {s:"APAGO",n:"APA do Pico do Goiapaba-Açu",cat:"APA",g:"US",piloto:true},
  {s:"APAGUA",n:"APA de Guanandy",cat:"APA",g:"US"},
  {s:"APAPE",n:"APA da Pedra do Elefante",cat:"APA",g:"US"},
  {s:"APAPM",n:"APA de Praia Mole",cat:"APA",g:"US"},
  {s:"ARIEMV",n:"ARIE do Morro da Vargem",cat:"ARIE",g:"US",piloto:true},
  {s:"RDSCO",n:"RDS Concha d'Ostra",cat:"RDS",g:"US"}
];

const PLANOS = {
  APAGO:{doc:"Plano de Manejo da APA do Pico do Goiapaba-Açu, Vol. II (Plantuc/IEMA, 2025)",aprov:"2025-06-30",obs:"Matriz Atividade × Meta × Indicador por programa (p. 29–44)."},
  ARIEMV:{doc:"Plano de Manejo da ARIE do Morro da Vargem, Vol. II (2025)",aprov:"2025-06-30",obs:"Estratégias com metas (p. 14) e matrizes por programa (p. 17–23)."},
  PEFG:{doc:"Plano de Manejo do Parque Estadual Forno Grande (IEMA, 2025)",aprov:"2025-05-09",obs:"10 planos priorizados (Tabela 5) e ações (Tabela 6, p. 44–55). O plano não fixa metas numéricas — prazos e indicadores marcados como “proposto”."},
  PEI:{doc:"Plano de Manejo do Parque Estadual de Itaúnas — Anexos I a VI (2025)",aprov:"2025-06-30",obs:"6 planos específicos a elaborar (Anexo III), TCPU (Anexo VI), TAC das barracas (Anexo V) e 14 sítios arqueológicos (Anexo IV)."}
};

const COMUNS = [
 ["Educação ambiental e relação com o entorno",[
  ["vis","Visitantes","visitas","Soma"],["reu","Reuniões do conselho","reuniões","Soma"],["eve","Eventos","eventos","Soma"],
  ["pev","Público dos eventos","participações","Soma"],["mid","Mídias","publicações","Soma"],["aci","Acidentes no uso público","acidentes","Soma"]]],
 ["Monitoramento ambiental e biodiversidade",[
  ["fau","Fauna total da UC","espécies","Último"],["faa","Espécies da fauna ameaçadas","espécies","Último"],["atr","Fauna atropelada","indivíduos","Soma"],
  ["flo","Flora total da UC","espécies","Último"],["fla","Espécies da flora ameaçadas","espécies","Último"],["exo","Manejo e controle de exóticas","ações","Soma"],
  ["mon","Ações de monitoramento da biodiversidade","ações","Soma"],["mfa","Manejo de fauna","ações","Soma"]]],
 ["Proteção e fiscalização",[
  ["cac","Caça, pesca ou retirada de animais","ocorrências","Soma"],["fog","Uso irregular do fogo","ocorrências","Soma"],["sup","Supressão de vegetação","ocorrências","Soma"],
  ["air","Atividade irregular dentro da UC","ocorrências","Soma"],["dom","Presença de animal doméstico","ocorrências","Soma"],["aut","Autuações realizadas","autos","Soma"],
  ["fis","Ações de fiscalização e monitoramento","ações","Soma"]]],
 ["Prevenção e combate a incêndios",[["inc","Incêndios combatidos","incêndios","Soma"],["roi","ROIF","relatórios","Soma"]]]
];

// Indicadores específicos — [id, nome, unidade, meta, atual(simulado), tipo('maior'|'menor'|'status'), fonte]
const ESPECIFICOS = {
 APAGO:[
  ["ap1","Dias de fiscalização no ano","dias",60,34,"maior","Vol. II, Proteção, ativ. 3 (p. 36)"],
  ["ap2","Reuniões do Conselho Gestor no ano","reuniões",12,9,"maior","Integração, ativ. 2 (p. 29)"],
  ["ap3","Pequenas barragens mapeadas","%",100,40,"maior","Proteção, ativ. 9 (p. 37)"],
  ["ap4","Residências incentivadas a instalar fossa séptica","%",100,18,"maior","Proteção, ativ. 12 (p. 38)"],
  ["ap5","Área afetada por incêndios","ha",0,3.2,"menor","Proteção, ativ. 13 (p. 38)"],
  ["ap6","Atividades educativas com o setor produtivo (ano)","atividades",2,1,"maior","Educação Ambiental, ativ. 4 (p. 31)"],
  ["ap7","Sinalização turística implementada","%",100,10,"maior","Uso Público, ativ. 3 (p. 34)"],
  ["ap8","Pesquisas sobre alvos (juçara, patioba, aves)","pesquisas",3,2,"maior","Pesquisa, ativ. 4 (p. 43)"]],
 ARIEMV:[
  ["ar1","Nascentes mapeadas e caracterizadas","%",100,55,"maior","Estratégia 2 (p. 14)"],
  ["ar2","Dias de fiscalização no ano","dias",60,41,"maior","Proteção, ativ. 3 (p. 20)"],
  ["ar3","Reuniões do Conselho Gestor no ano","reuniões",12,10,"maior","Integração, ativ. 2 (p. 17)"],
  ["ar4","Residências com reunião sobre fossa séptica","%",100,25,"maior","Proteção, ativ. 11 (p. 20)"],
  ["ar5","Trilhas turísticas mapeadas","%",100,70,"maior","Uso Público, ativ. 4 (p. 19)"],
  ["ar6","Monitoramento anual da qualidade da água","campanhas",1,1,"maior","Proteção, ativ. 9 (p. 20)"]],
 PEFG:[
  ["fg1","Acessos clandestinos bloqueados","acessos",10,4,"maior","Proteção da biodiversidade (p. 48) — meta proposta"],
  ["fg2","Ataques de cães à fauna registrados","casos",0,3,"menor","Proteção da biodiversidade (p. 48)"],
  ["fg3","Campanhas contra caça e captura de aves","campanhas",2,1,"maior","Comunicação e EA (p. 52) — meta proposta"],
  ["fg4","Escolas atendidas — Preservando o Nosso Quintal","escolas",10,8,"maior","Comunicação e EA (p. 52) — meta proposta"],
  ["fg5","Voluntários PVUC ativos","voluntários",8,6,"maior","Visitação (p. 50) — meta proposta"],
  ["fg6","Ações de controle de espécies exóticas","ações",6,5,"maior","Controle de exóticas (p. 47) — meta proposta"]],
 PEI:[
  ["it1","Planos específicos elaborados","planos",6,1,"maior","Anexo III — 6 planos"],
  ["it2","Ninhos de tartarugas marinhas monitorados (temporada)","ninhos",null,112,"maior","Anexo III, 1.4 (RVF tartarugas)"],
  ["it3","Campanhas de monitoramento do peixe-anual-de-Itaúnas","campanhas",2,1,"maior","Anexo III, 1.4 (RVF peixe-anual)"],
  ["it4","TCPU firmados com comunidades tradicionais","termos",3,0,"maior","Anexo VI — 3 TCPU em andamento"],
  ["it5","Barracas de praia em conformidade com o TAC","barracas",8,5,"maior","Anexo V — 8 barracas"],
  ["it6","Sítios arqueológicos vistoriados no ano","sítios",14,6,"maior","Anexo IV — 14 sítios"]]
};

// Usuários (fictícios)
const USERS = [
  {id:"u0",nome:"Coordenação GGUC",email:"gguc@exemplo.org",papel:"admin",uc:null},
  {id:"u1",nome:"Marina (gestora)",email:"gestor.apago@exemplo.org",papel:"gestor",uc:"APAGO"},
  {id:"u2",nome:"Rafael (técnico)",email:"tecnico.apago@exemplo.org",papel:"tecnico",uc:"APAGO"},
  {id:"u3",nome:"Lúcia (gestora)",email:"gestor.ariemv@exemplo.org",papel:"gestor",uc:"ARIEMV"},
  {id:"u4",nome:"Bruno (técnico)",email:"tecnico.ariemv@exemplo.org",papel:"tecnico",uc:"ARIEMV"},
  {id:"u5",nome:"Carla (gestora)",email:"gestor.pefg@exemplo.org",papel:"gestor",uc:"PEFG"},
  {id:"u6",nome:"Diego (técnico)",email:"tecnico.pefg@exemplo.org",papel:"tecnico",uc:"PEFG"},
  {id:"u7",nome:"Helena (gestora)",email:"gestor.pei@exemplo.org",papel:"gestor",uc:"PEI"},
  {id:"u8",nome:"Tiago (técnico)",email:"tecnico.pei@exemplo.org",papel:"tecnico",uc:"PEI"},
  {id:"u9",nome:"Paula (técnica)",email:"tecnico2.pei@exemplo.org",papel:"tecnico",uc:"PEI"}
];

// Ações do plano de manejo: [uc, programa, atividade, meta, indicador, prazo(AAAA-MM-DD), resp, status, progresso, fonte]
// status: nao | and | conc   (atrasada/a vencer são calculados pelo prazo)
const ACOES_BASE = [
 // APAGO
 ["APAGO","Integração com produtores rurais","Realizar reuniões mensais do Conselho Gestor","Reuniões mensais com atualização de demandas e prazos","Atas das reuniões","2026-12-31","u1","and",75,"p. 29, ativ. 2"],
 ["APAGO","Integração com produtores rurais","Consolidar programa de voluntariado da APAGO","Programa consolidado em até 3 anos","Programa consolidado e executado","2028-06-30","u2","nao",0,"p. 29, ativ. 5"],
 ["APAGO","Integração com produtores rurais","Reuniões específicas com o Quilombo São Pedro","Consulta livre, prévia e informada; usos tradicionais","Registro de atas","2026-12-31","u1","and",50,"p. 29, ativ. 6"],
 ["APAGO","Educação ambiental","Consolidar Plano de Ação de Educação Ambiental","Plano consolidado em até 3 anos","Plano de ação consolidado","2028-06-30","u2","and",20,"p. 31, ativ. 1"],
 ["APAGO","Educação ambiental","Mapear escolas do entorno e firmar parcerias","Mapeamento e estratégias em até 3 anos","Nº de escolas mapeadas e parcerias","2028-06-30","u2","and",35,"p. 31, ativ. 3"],
 ["APAGO","Uso público","Elaborar projeto de sinalização","Projeto em 3 anos; implantação em 5 anos","Projeto elaborado; % implantado","2028-06-30","u2","nao",0,"p. 34, ativ. 3"],
 ["APAGO","Proteção","Realizar oficina anual de planejamento integrado da fiscalização","Uma oficina por ano com IEMA, IBAMA, polícia e municípios","Matriz de responsabilidades","2026-11-30","u1","nao",0,"p. 36, ativ. 2"],
 ["APAGO","Proteção","Cumprir 60 dias de fiscalização no ano","Mínimo de 60 dias/ano","Dias de fiscalização e autos","2026-12-31","u2","and",57,"p. 36, ativ. 3"],
 ["APAGO","Proteção","Estruturar banco de dados SIG de ilícitos e denúncias","Banco entregue em até 1 ano","Banco implementado e atualizado","2026-06-30","u2","and",60,"p. 36, ativ. 4"],
 ["APAGO","Proteção","Mapear 100% das pequenas barragens","100% mapeadas em 1 ano; cadastro IDAF em 5 anos","% de barragens mapeadas","2026-06-30","u2","and",40,"p. 37, ativ. 9"],
 ["APAGO","Proteção","Formalizar parceria municipal de coleta de resíduos","Parceria em até 360 dias","Parceria formalizada","2026-06-25","u1","nao",0,"p. 37, ativ. 11"],
 ["APAGO","Proteção","Reduzir focos de incêndio","Redução em até 2 anos","Área (ha) afetada por incêndios","2027-06-30","u2","and",30,"p. 38, ativ. 13"],
 ["APAGO","Comunicação","Elaborar e consolidar o Plano de Comunicação","Plano em até 1 ano","Plano elaborado e consolidado","2026-06-30","u1","conc",100,"p. 39, ativ. 1"],
 ["APAGO","Gestão e administração","Elaborar plano anual de trabalho","Plano anual consolidado","Plano elaborado","2026-12-15","u1","and",80,"p. 41, ativ. 1"],
 ["APAGO","Pesquisa","Produzir mapa geológico da APAGO","Mapa em até 5 anos","Estudos e mapa digitalizado","2030-06-30","u2","nao",0,"p. 43, ativ. 1"],
 ["APAGO","Pesquisa","Fomentar pesquisas sobre juçara, patioba e aves ameaçadas","Pesquisas em até 5 anos","Nº de pesquisas","2030-06-30","u2","and",40,"p. 43, ativ. 4"],
 // ARIEMV
 ["ARIEMV","Estratégia — comunicação e EA","Elaborar Plano de Comunicação e Educação Ambiental","Plano em 1,5 ano pelo Grupo Interinstitucional","Plano elaborado","2026-12-31","u3","and",65,"p. 14, estratégia 1"],
 ["ARIEMV","Estratégia — nascentes","Mapear e caracterizar 100% das nascentes","100% em 2 anos","% de nascentes mapeadas","2027-06-30","u4","and",55,"p. 14, estratégia 2"],
 ["ARIEMV","Integração com produtores rurais","Reuniões semestrais com proprietários rurais","Duas por ano","Lista de presença e ata","2026-12-31","u3","and",50,"p. 17, ativ. 3"],
 ["ARIEMV","Educação ambiental","Firmar parcerias com escolas de Ibiraçu","Mapeamento e estratégias em até 3 anos","Escolas mapeadas e parcerias","2028-06-30","u4","nao",0,"p. 18, ativ. 3"],
 ["ARIEMV","Uso público","Mapear todas as trilhas turísticas","Mapeamento em até 3 anos","Mapeamento realizado","2028-06-30","u4","and",70,"p. 19, ativ. 4"],
 ["ARIEMV","Proteção","Cumprir 60 dias de fiscalização no ano","Mínimo de 60 dias/ano","Dias de fiscalização","2026-12-31","u4","and",68,"p. 20, ativ. 3"],
 ["ARIEMV","Proteção","Estruturar banco de dados SIG de ilícitos","Banco em até 1 ano","Banco implementado","2026-06-30","u4","nao",0,"p. 20, ativ. 4"],
 ["ARIEMV","Proteção","Formalizar parceria de coleta de resíduos com Ibiraçu","Parceria em até 180 dias","Parceria formalizada","2025-12-27","u3","conc",100,"p. 20, ativ. 10"],
 ["ARIEMV","Proteção","Interditar atividades mineradoras e notificar a ANM","Fiscalização sistemática","Atividade coibida","2026-12-31","u3","and",50,"p. 20, ativ. 7"],
 ["ARIEMV","Comunicação","Atualizar seção do site do IEMA e redes sociais","Em até 3 anos","Site e redes atualizados","2028-06-30","u3","and",30,"p. 21, ativ. 3"],
 ["ARIEMV","Gestão e administração","Elaborar Instrumento Regulamentador Específico","Em até 3 anos","Instrumento regulamentado","2028-06-30","u3","nao",0,"p. 22, ativ. 1"],
 ["ARIEMV","Pesquisa","Incentivar pesquisas sobre a gênese geomorfológica do Morro da Vargem","Elucidar a gênese","Divulgação dos estudos","2029-06-30","u4","nao",0,"p. 23, ativ. 2"],
 // PEFG
 ["PEFG","Consolidação territorial (ALTA)","Enviar levantamento fundiário à instância superior","Proposto: até dez/2026","Processo encaminhado","2026-12-31","u5","and",60,"Tabela 6, p. 44"],
 ["PEFG","Consolidação territorial (ALTA)","Estabelecer regras para a Zona de Amortecimento","Proposto: até dez/2026","Regras publicadas","2026-12-31","u5","nao",0,"Tabela 6, p. 44"],
 ["PEFG","Comunicação e EA (ALTA)","Realizar “Preservando o Nosso Quintal” e “Biblioteca Itinerante”","Proposto: anual","Escolas atendidas","2026-12-15","u6","and",80,"Tabela 6, p. 52"],
 ["PEFG","Comunicação e EA (ALTA)","Criar cartilha didática sobre o plano de manejo","Proposto: até jun/2026","Cartilha publicada","2026-06-30","u6","and",40,"Tabela 6, p. 52"],
 ["PEFG","Comunicação e EA (ALTA)","Campanhas locais contra caça e captura de aves","Proposto: 2 por ano","Nº de campanhas","2026-12-31","u6","and",50,"Tabela 6, p. 52"],
 ["PEFG","Pesquisa (ALTA)","Publicar edital de chamamento para pesquisa","Proposto: até dez/2026","Edital publicado","2026-11-28","u5","nao",0,"Tabela 6, p. 46"],
 ["PEFG","Proteção da biodiversidade (ALTA)","Elaborar rotina e cronograma de fiscalização","Proposto: até mar/2026","Cronograma em uso","2026-03-31","u5","conc",100,"Tabela 6, p. 48"],
 ["PEFG","Proteção da biodiversidade (ALTA)","Bloquear acessos clandestinos e sinalizar limites","Proposto: 10 acessos","Acessos bloqueados","2026-12-31","u6","and",40,"Tabela 6, p. 48"],
 ["PEFG","Proteção da biodiversidade (ALTA)","Instalar bebedouros para fauna na estiagem","Proposto: antes da estiagem","Bebedouros instalados","2026-08-31","u6","nao",0,"Tabela 6, p. 48"],
 ["PEFG","Visitação (MÉDIA)","Instalar guarda-corpo no mirante da Pedra Azul","Proposto: até dez/2027","Estrutura instalada","2027-12-31","u5","nao",0,"Tabela 6, p. 50"],
 ["PEFG","Visitação (MÉDIA)","Criar plano de contingência e gerenciamento de risco","Proposto: até dez/2027","Plano aprovado","2027-12-31","u5","and",15,"Tabela 6, p. 50"],
 ["PEFG","Controle de exóticas (BAIXA)","Elaborar cronograma de monitoramento e controle de exóticas","Proposto: até dez/2028","Cronograma em uso","2028-12-31","u6","nao",0,"Tabela 6, p. 47"],
 ["PEFG","Prevenção e combate a incêndios (BAIXA)","Executar ações do Prevines na UC","Proposto: anual","Ações realizadas","2026-12-31","u6","and",60,"Tabela 6, p. 54"],
 // PEI
 ["PEI","Monitoramento e biodiversidade","Elaborar Plano de Monitoramento Ambiental e Conservação da Biodiversidade","Proposto: até jun/2027","Plano aprovado","2027-06-30","u8","and",25,"Anexo III, plano 1"],
 ["PEI","Monitoramento e biodiversidade","Monitorar ninhos de tartarugas marinhas na temporada","Toda a temporada reprodutiva","Ninhos monitorados","2027-03-31","u9","and",45,"Anexo III, 1.4"],
 ["PEI","Monitoramento e biodiversidade","Campanhas de monitoramento do peixe-anual-de-Itaúnas","Proposto: 2 por ano","Campanhas realizadas","2026-12-31","u9","and",50,"Anexo III, 1.4"],
 ["PEI","Educação ambiental e comunicação","Elaborar Plano de Educação Ambiental e Comunicação","Proposto: até dez/2027","Plano aprovado","2027-12-31","u7","nao",0,"Anexo III, plano 2"],
 ["PEI","Gestão socioambiental","Firmar TCPU — Aldeia Jacó Pataxó","Proposto: até dez/2026","Termo assinado","2026-12-31","u7","and",70,"Anexo VI"],
 ["PEI","Gestão socioambiental","Firmar TCPU — Comunidade de Riacho Doce","Proposto: até dez/2026","Termo assinado","2026-12-31","u7","and",60,"Anexo VI"],
 ["PEI","Gestão socioambiental","Firmar TCPU — Pescadores artesanais do Rio Itaúnas","Proposto: até jun/2026","Termo assinado","2026-06-30","u7","and",30,"Anexo VI"],
 ["PEI","Uso público","Acompanhar conformidade das 8 barracas com o TAC","Vistoria semestral","Barracas em conformidade","2026-11-25","u8","and",62,"Anexo V"],
 ["PEI","Uso público","Elaborar Plano de Uso Público","Proposto: até dez/2027","Plano aprovado","2027-12-31","u8","nao",0,"Anexo III, plano 4"],
 ["PEI","Proteção e consolidação territorial","Vistoriar os 14 sítios arqueológicos","Proposto: 14 por ano","Sítios vistoriados","2026-12-31","u9","and",43,"Anexo IV"],
 ["PEI","Proteção e consolidação territorial","Elaborar Plano de Proteção e Consolidação Territorial","Proposto: até jun/2026","Plano aprovado","2026-06-30","u8","and",35,"Anexo III, plano 5"],
 ["PEI","Gestão","Elaborar Plano de Gestão (administração, conselho, parcerias)","Proposto: até dez/2026","Plano aprovado","2026-12-31","u7","conc",100,"Anexo III, plano 6"]
];
