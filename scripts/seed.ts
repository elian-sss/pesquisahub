// Popula o banco com dados realistas para demo e desenvolvimento.
// Rode com: npm run seed
//
// O script LIMPA as colecoes antes de inserir — nao rode em producao.

import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import mongoose from "mongoose";
import { connectMongo } from "@/lib/db/connection";
import {
  UsuarioModel,
  ProgramaModel,
  UnidadeAcademicaModel,
  ProjetoModel,
} from "@/models";
import { QUICK_LOGIN, SEED_PASSWORD } from "@/lib/seed-credentials";

const oid = () => new Types.ObjectId();
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

async function main() {
  console.log("Conectando ao MongoDB...");
  await connectMongo();

  console.log("Limpando coleções...");
  // registros_horas e arquivos agora vivem embedados em usuarios/projetos,
  // entao limpar essas duas colecoes ja remove tudo.
  await Promise.all([
    UsuarioModel.deleteMany({}),
    ProgramaModel.deleteMany({}),
    UnidadeAcademicaModel.deleteMany({}),
    ProjetoModel.deleteMany({}),
  ]);

  // ========================================================
  // UNIDADES ACADEMICAS
  // ========================================================
  console.log("Inserindo unidades acadêmicas...");
  // ibef e omitido de propósito: o projeto PD_EMBRAPII demonstra o caso sem
  // unidade academica (parceria com empresa nao se vincula a um instituto).
  const [iced, , icta] = await UnidadeAcademicaModel.insertMany([
    { sigla: "ICED", nome: "Instituto de Ciências da Educação", campus: "Tapajós", tipo: "instituto" },
    { sigla: "IBEF", nome: "Instituto de Biodiversidade e Florestas", campus: "Tapajós", tipo: "instituto" },
    { sigla: "ICTA", nome: "Instituto de Engenharia e Geociências", campus: "Tapajós", tipo: "instituto" },
  ]);

  // ========================================================
  // PROGRAMAS
  // ========================================================
  console.log("Inserindo programas...");
  const [monitoria, pet, piape, pibic, embrapii] = await ProgramaModel.insertMany([
    {
      sigla: "MON",
      nome_completo: "Programa de Monitoria",
      tipo: "MONITORIA",
      pro_reitoria: "PROEN",
      natureza: "interno",
      site: "https://www.ufopa.edu.br/proen/monitoria",
      modalidades_bolsa: [
        { nome: "Monitoria Remunerada", valor: 400, agencia_pagadora: "UFOPA", duracao_meses: 6 },
        { nome: "Monitoria Voluntária", valor: 0, duracao_meses: 6 },
      ],
      regulamento: {
        url_documento: "https://www.ufopa.edu.br/proen/monitoria/regulamento.pdf",
        data_aprovacao: new Date("2024-03-15"),
        versao: "2024.1",
      },
      contato_responsavel: { nome: "DAEN/PROEN", email: "monitoria@ufopa.edu.br", telefone: "(93) 2101-7000" },
      requisitos: {
        exige_lattes: false,
        exige_plano_trabalho: true,
        exige_relatorio_parcial: false,
        exige_relatorio_final: true,
        exige_apresentacao_seminario: false,
      },
      ativo: true,
    },
    {
      sigla: "PET-COMP",
      nome_completo: "Programa de Educação Tutorial — Computação",
      tipo: "PET",
      pro_reitoria: "PROEN",
      natureza: "externo",
      site: "https://www.gov.br/mec/pt-br/pet",
      modalidades_bolsa: [
        { nome: "Bolsa Tutor PET", valor: 2700, agencia_pagadora: "FNDE/MEC", duracao_meses: 12 },
        { nome: "Bolsa Bolsista PET", valor: 700, agencia_pagadora: "FNDE/MEC", duracao_meses: 12 },
      ],
      regulamento: {
        url_documento: "https://www.gov.br/mec/pt-br/pet/manual",
        data_aprovacao: new Date("2010-01-01"),
        versao: "Portaria 343/2013",
      },
      contato_responsavel: { nome: "SESu/MEC", email: "pet@mec.gov.br" },
      requisitos: {
        exige_lattes: true,
        exige_plano_trabalho: true,
        exige_relatorio_parcial: true,
        exige_relatorio_final: true,
        exige_apresentacao_seminario: true,
      },
      ativo: true,
    },
    {
      sigla: "PIAPE",
      nome_completo: "Programa Institucional de Apoio a Projetos de Extensão",
      tipo: "PIAPE",
      pro_reitoria: "PROCCE",
      natureza: "interno",
      modalidades_bolsa: [
        { nome: "Bolsa PIAPE", valor: 500, agencia_pagadora: "UFOPA", duracao_meses: 10 },
      ],
      regulamento: { data_aprovacao: new Date("2024-02-20"), versao: "2024" },
      contato_responsavel: { nome: "PROCCE", email: "procce@ufopa.edu.br" },
      requisitos: {
        exige_lattes: false,
        exige_plano_trabalho: true,
        exige_relatorio_parcial: true,
        exige_relatorio_final: true,
        exige_apresentacao_seminario: true,
      },
      ativo: true,
    },
    {
      sigla: "PIBIC",
      nome_completo: "Programa Institucional de Bolsas de Iniciação Científica",
      tipo: "PIBIC",
      pro_reitoria: "PROPPIT",
      natureza: "externo",
      site: "https://www.ufopa.edu.br/proppit/pibic",
      modalidades_bolsa: [
        { nome: "PIBIC/CNPq", valor: 700, agencia_pagadora: "CNPq", duracao_meses: 12 },
        { nome: "PIBIC/FAPESPA", valor: 700, agencia_pagadora: "FAPESPA", duracao_meses: 12 },
        { nome: "PIBIC/UFOPA", valor: 700, agencia_pagadora: "UFOPA", duracao_meses: 12 },
        { nome: "Voluntário", valor: 0, duracao_meses: 12 },
      ],
      regulamento: {
        url_documento: "https://www.ufopa.edu.br/proppit/edital-pibic-2025.pdf",
        data_aprovacao: new Date("2025-04-10"),
        versao: "Edital 02/2025",
      },
      contato_responsavel: { nome: "PROPPIT", email: "pibic@ufopa.edu.br" },
      requisitos: {
        exige_lattes: true,
        exige_plano_trabalho: true,
        exige_relatorio_parcial: true,
        exige_relatorio_final: true,
        exige_apresentacao_seminario: true,
      },
      ativo: true,
    },
    {
      sigla: "EMBRAPII",
      nome_completo: "Unidade EMBRAPII — Tecnologias para Amazônia",
      tipo: "PD_EMBRAPII",
      pro_reitoria: "PROPPIT",
      natureza: "externo",
      site: "https://embrapii.org.br",
      modalidades_bolsa: [
        { nome: "Bolsa Pesquisador EMBRAPII", valor: 4500, agencia_pagadora: "EMBRAPII", duracao_meses: 12 },
        { nome: "Bolsa Discente EMBRAPII", valor: 1200, agencia_pagadora: "EMBRAPII", duracao_meses: 12 },
      ],
      regulamento: { data_aprovacao: new Date("2023-06-01"), versao: "MGE 2023" },
      contato_responsavel: { nome: "EMBRAPII UFOPA", email: "embrapii@ufopa.edu.br" },
      requisitos: {
        exige_lattes: true,
        exige_plano_trabalho: true,
        exige_relatorio_parcial: true,
        exige_relatorio_final: true,
        exige_apresentacao_seminario: false,
      },
      ativo: true,
    },
  ]);

  // ========================================================
  // USUARIOS
  // ========================================================
  console.log("Inserindo usuários (hashing senhas)...");
  const senha_hash = await bcrypt.hash(SEED_PASSWORD, 10);

  const baseUsuario = (extras: Record<string, unknown>) => ({
    senha_hash,
    contato: { telefone: "(93) 9 8000-0000" },
    endereco: { cidade: "Santarém", estado: "PA", cep: "68040-470" },
    preferencias: { notificacoes_email: true, notificacoes_sistema: true, tema: "claro" as const },
    ...extras,
  });

  const usuariosInseridos = await UsuarioModel.insertMany([
    baseUsuario({
      nome: "Beatriz Souza",
      email: QUICK_LOGIN.admin.email,
      role: "ADMIN",
      categoria: "tecnico_administrativo",
      matricula: "ADM-0001",
      campus: "Tapajós",
      academico: { orcid: "0000-0001-2345-6789" },
    }),
    baseUsuario({
      nome: "Maria Silva",
      email: QUICK_LOGIN.coord.email,
      role: "COORDENADOR",
      categoria: "docente",
      matricula: "DOC-1001",
      unidade_academica_id: icta._id,
      campus: "Tapajós",
      academico: {
        lattes: "http://lattes.cnpq.br/1234567890123456",
        orcid: "0000-0002-1234-5678",
      },
    }),
    baseUsuario({
      nome: "Carlos Mendes",
      email: "carlos.mendes@ufopa.edu.br",
      role: "COORDENADOR",
      categoria: "docente",
      matricula: "DOC-1002",
      unidade_academica_id: icta._id,
      campus: "Tapajós",
      academico: { lattes: "http://lattes.cnpq.br/2345678901234567" },
    }),
    baseUsuario({
      nome: "Ana Beatriz Costa",
      email: "ana.costa@ufopa.edu.br",
      role: "COORDENADOR",
      categoria: "docente",
      matricula: "DOC-1003",
      unidade_academica_id: iced._id,
      campus: "Tapajós",
      academico: { lattes: "http://lattes.cnpq.br/3456789012345678" },
    }),
    baseUsuario({
      nome: "João Pereira",
      email: QUICK_LOGIN.bolsista.email,
      role: "BOLSISTA",
      categoria: "discente_graduacao",
      matricula: "2023012345",
      curso: "Engenharia de Computação",
      unidade_academica_id: icta._id,
      campus: "Tapajós",
      academico: { semestre_ingresso: "2023.1", previsao_conclusao: "2027.2" },
      dados_bancarios: { banco: "Banco do Brasil", agencia: "0001", conta: "12345-6", tipo: "corrente" as const },
    }),
    baseUsuario({
      nome: "Larissa Oliveira",
      email: "larissa.oliveira@aluno.ufopa.edu.br",
      role: "BOLSISTA",
      categoria: "discente_graduacao",
      matricula: "2022098765",
      curso: "Engenharia Elétrica",
      unidade_academica_id: icta._id,
      campus: "Tapajós",
      academico: { semestre_ingresso: "2022.1", previsao_conclusao: "2026.2" },
    }),
    baseUsuario({
      nome: "Rafael Santos",
      email: "rafael.santos@aluno.ufopa.edu.br",
      role: "BOLSISTA",
      categoria: "discente_graduacao",
      matricula: "2024001122",
      curso: "Ciência da Computação",
      unidade_academica_id: icta._id,
      campus: "Tapajós",
      academico: { semestre_ingresso: "2024.1", previsao_conclusao: "2028.2" },
    }),
    baseUsuario({
      nome: "Juliana Rocha",
      email: "juliana.rocha@aluno.ufopa.edu.br",
      role: "BOLSISTA",
      categoria: "discente_graduacao",
      matricula: "2023055544",
      curso: "Pedagogia",
      unidade_academica_id: iced._id,
      campus: "Tapajós",
      academico: { semestre_ingresso: "2023.1", previsao_conclusao: "2027.2" },
    }),
  ]);

  const [admin, maria, carlos, ana, joao, larissa, rafael, juliana] = usuariosInseridos;

  // ========================================================
  // PROJETOS (6 — cobrindo todos os tipos)
  // ========================================================
  console.log("Inserindo projetos...");

  const buildEquipeBase = (
    coord: { _id: Types.ObjectId; nome: string; categoria: string },
    bolsistas: Array<{ _id: Types.ObjectId; nome: string; categoria: string }>,
    inicio: Date,
  ) => [
    {
      usuario_id: coord._id,
      nome: coord.nome,
      papel: "coordenador" as const,
      categoria: coord.categoria,
      carga_horaria_semanal: 8,
      periodo: { inicio },
    },
    ...bolsistas.map((b) => ({
      usuario_id: b._id,
      nome: b.nome,
      papel: "bolsista" as const,
      categoria: b.categoria,
      tipo_vinculo: "bolsista" as const,
      valor_bolsa: 700,
      carga_horaria_semanal: 20,
      periodo: { inicio },
    })),
  ];

  const cronogramaPadrao = (inicio: Date) => {
    const meta1Prazo = new Date(inicio); meta1Prazo.setMonth(meta1Prazo.getMonth() + 3);
    const meta2Prazo = new Date(inicio); meta2Prazo.setMonth(meta2Prazo.getMonth() + 6);
    const meta3Prazo = new Date(inicio); meta3Prazo.setMonth(meta3Prazo.getMonth() + 9);
    const meta4Prazo = new Date(inicio); meta4Prazo.setMonth(meta4Prazo.getMonth() + 12);
    return [
      {
        _id: oid(),
        titulo: "Revisão bibliográfica",
        prazo: meta1Prazo,
        status: "concluido" as const,
        concluido_em: meta1Prazo,
        entregas: [
          { _id: oid(), descricao: "Mapa conceitual da literatura", status: "concluido" as const },
          { _id: oid(), descricao: "Anotações comentadas (10 artigos)", status: "concluido" as const },
        ],
      },
      {
        _id: oid(),
        titulo: "Coleta e preparação de dados",
        prazo: meta2Prazo,
        status: "em_andamento" as const,
        entregas: [
          { _id: oid(), descricao: "Protocolo de coleta validado", status: "concluido" as const },
          { _id: oid(), descricao: "Dataset preparado", status: "em_andamento" as const },
        ],
      },
      {
        _id: oid(),
        titulo: "Análise e resultados parciais",
        prazo: meta3Prazo,
        status: "planejado" as const,
        entregas: [
          { _id: oid(), descricao: "Notebook de análise exploratória", status: "pendente" as const },
          { _id: oid(), descricao: "Relatório parcial", status: "pendente" as const },
        ],
      },
      {
        _id: oid(),
        titulo: "Relatório final e disseminação",
        prazo: meta4Prazo,
        status: "planejado" as const,
        entregas: [
          { _id: oid(), descricao: "Relatório final", status: "pendente" as const },
          { _id: oid(), descricao: "Apresentação no SIEPE", status: "pendente" as const },
        ],
      },
    ];
  };

  const projetosInseridos = await ProjetoModel.insertMany([
    // --- 1. MONITORIA ---
    {
      titulo: "Monitoria de Algoritmos e Estrutura de Dados",
      descricao:
        "Apoio aos discentes da disciplina de Algoritmos e Estrutura de Dados I, com plantões semanais, listas comentadas e revisão de conteúdo para a turma 2026.1.",
      tipo: "MONITORIA",
      status: "em_andamento",
      sigaa_id: "MON-2026-1-001",
      programa_id: monitoria._id,
      unidade_academica_id: icta._id,
      campus: "Tapajós",
      vigencia: {
        inicio: daysAgo(60),
        fim: daysFromNow(120),
        prorrogacoes: [],
      },
      equipe: buildEquipeBase(
        { _id: maria._id, nome: maria.nome, categoria: maria.categoria },
        [{ _id: larissa._id, nome: larissa.nome, categoria: larissa.categoria }],
        daysAgo(60),
      ),
      cronograma: [
        {
          _id: oid(),
          titulo: "Estruturar plantões e listas",
          prazo: daysAgo(40),
          status: "concluido" as const,
          concluido_em: daysAgo(35),
          entregas: [
            { _id: oid(), descricao: "Cronograma de plantões publicado", status: "concluido" as const, responsavel_id: larissa._id },
            { _id: oid(), descricao: "Lista 1 comentada", status: "concluido" as const, responsavel_id: larissa._id },
          ],
        },
        {
          _id: oid(),
          titulo: "Atendimento meio do semestre",
          prazo: daysFromNow(30),
          status: "em_andamento" as const,
          entregas: [
            { _id: oid(), descricao: "Lista 2 comentada", status: "em_andamento" as const, responsavel_id: larissa._id },
            { _id: oid(), descricao: "Revisão pré-prova", status: "pendente" as const, responsavel_id: larissa._id },
          ],
        },
        {
          _id: oid(),
          titulo: "Relatório final",
          prazo: daysFromNow(110),
          status: "planejado" as const,
          entregas: [
            { _id: oid(), descricao: "Relatório com indicadores de atendimento", status: "pendente" as const, responsavel_id: larissa._id },
          ],
        },
      ],
      metadados_programa: {
        subtipo: "DISCIPLINA",
        modalidade: "remunerada",
        semestre_letivo: "2026.1",
        carga_horaria_semanal: 12,
        disciplina: {
          codigo: "CC1023",
          nome: "Algoritmos e Estrutura de Dados I",
          turma: "TURMA-A",
          num_alunos_atendidos: 35,
        },
        atividades_previstas: [
          "Plantão de dúvidas semanal",
          "Listas comentadas",
          "Revisões pré-prova",
        ],
      },
      recursos: {
        drive: "https://drive.google.com/drive/ed1-monitoria",
        outros: [],
      },
    },

    // --- 2. PET ---
    {
      titulo: "PET-Computação UFOPA — Tecnologias para Educação Amazônica",
      descricao:
        "Grupo PET focado em projetos de ensino, pesquisa e extensão usando tecnologia para apoiar escolas ribeirinhas da região do Tapajós.",
      tipo: "PET",
      status: "em_andamento",
      sigaa_id: "PET-COMP-2025",
      programa_id: pet._id,
      unidade_academica_id: icta._id,
      campus: "Tapajós",
      vigencia: {
        inicio: daysAgo(180),
        fim: daysFromNow(540),
        prorrogacoes: [],
      },
      equipe: [
        {
          usuario_id: carlos._id,
          nome: carlos.nome,
          papel: "coordenador" as const,
          categoria: carlos.categoria,
          carga_horaria_semanal: 10,
          periodo: { inicio: daysAgo(180) },
        },
        {
          usuario_id: joao._id,
          nome: joao.nome,
          papel: "bolsista" as const,
          categoria: joao.categoria,
          tipo_vinculo: "bolsista" as const,
          valor_bolsa: 700,
          carga_horaria_semanal: 20,
          periodo: { inicio: daysAgo(180) },
        },
        {
          usuario_id: rafael._id,
          nome: rafael.nome,
          papel: "bolsista" as const,
          categoria: rafael.categoria,
          tipo_vinculo: "bolsista" as const,
          valor_bolsa: 700,
          carga_horaria_semanal: 20,
          periodo: { inicio: daysAgo(120) },
        },
      ],
      cronograma: cronogramaPadrao(daysAgo(180)),
      metadados_programa: {
        grupo: "PET-Computação UFOPA",
        area_tematica: "Tecnologia educacional e inclusão digital",
        ano_criacao: 2010,
        tutor_atual_id: carlos._id,
        num_bolsistas_atual: 12,
        atividades: {
          ensino: [
            "Tutoria em Programação I",
            "Oficinas de Python para calouros",
          ],
          pesquisa: [
            "Análise de evasão em cursos de computação",
            "Sistemas low-cost para conectividade rural",
          ],
          extensao: [
            "Curso de robótica educacional para escolas públicas",
            "Letramento digital para idosos",
          ],
        },
      },
      recursos: {
        repositorio_git: "https://github.com/petcomp-ufopa",
        drive: "https://drive.google.com/drive/petcomp",
        outros: [
          {
            nome: "Blog do grupo",
            url: "https://petcomp.ufopa.edu.br",
            tipo: "site",
          },
        ],
      },
    },

    // --- 3. PIAPE ---
    {
      titulo: "PIAPE — Letramento digital para comunidades ribeirinhas",
      descricao:
        "Projeto institucional de extensão que leva oficinas de letramento digital básico para 4 comunidades ribeirinhas da região de Santarém ao longo de 10 meses.",
      tipo: "PIAPE",
      status: "em_andamento",
      programa_id: piape._id,
      unidade_academica_id: iced._id,
      campus: "Tapajós",
      vigencia: {
        inicio: daysAgo(90),
        fim: daysFromNow(210),
        prorrogacoes: [],
      },
      equipe: [
        {
          usuario_id: ana._id,
          nome: ana.nome,
          papel: "coordenador" as const,
          categoria: ana.categoria,
          carga_horaria_semanal: 8,
          periodo: { inicio: daysAgo(90) },
        },
        {
          usuario_id: juliana._id,
          nome: juliana.nome,
          papel: "bolsista" as const,
          categoria: juliana.categoria,
          tipo_vinculo: "bolsista" as const,
          valor_bolsa: 500,
          carga_horaria_semanal: 20,
          periodo: { inicio: daysAgo(90) },
        },
      ],
      cronograma: cronogramaPadrao(daysAgo(90)),
      metadados_programa: {
        unidade_demandante: "Diretoria de Inclusão Digital — UFOPA",
        tipo_demanda: "servico",
        problema_institucional:
          "Comunidades ribeirinhas do entorno de Santarém têm acesso limitado a serviços públicos digitais (e-Gov, benefícios sociais).",
        solucao_proposta:
          "Oficinas presenciais mensais em 4 comunidades cobrindo navegação básica, identidade digital (Gov.br), banking e proteção contra golpes.",
        categoria_inovacao: "Inovação social",
        coordenador_categoria: "docente",
        beneficiarios_estimados: 240,
      },
      recursos: {
        drive: "https://drive.google.com/drive/piape-letramento",
        outros: [],
      },
    },

    // --- 4. PIBIC ---
    {
      titulo: "Análise de algoritmos de roteamento em redes mesh comunitárias",
      descricao:
        "Estudo comparativo de desempenho, latência e overhead de protocolos de roteamento (BATMAN-adv, OLSR, Babel) em redes mesh sem fio aplicadas a contextos comunitários de baixa infraestrutura.",
      tipo: "PIBIC",
      status: "em_andamento",
      sigaa_id: "PIBIC-2025-042",
      programa_id: pibic._id,
      unidade_academica_id: icta._id,
      campus: "Tapajós",
      vigencia: {
        inicio: daysAgo(120),
        fim: daysFromNow(245),
        prorrogacoes: [],
      },
      equipe: [
        {
          usuario_id: maria._id,
          nome: maria.nome,
          papel: "coordenador" as const,
          categoria: maria.categoria,
          carga_horaria_semanal: 8,
          periodo: { inicio: daysAgo(120) },
        },
        {
          usuario_id: joao._id,
          nome: joao.nome,
          papel: "bolsista" as const,
          categoria: joao.categoria,
          tipo_vinculo: "bolsista" as const,
          valor_bolsa: 700,
          carga_horaria_semanal: 20,
          periodo: { inicio: daysAgo(120) },
        },
      ],
      cronograma: cronogramaPadrao(daysAgo(120)),
      metadados_programa: {
        modalidade: "PIBIC",
        tem_bolsa: true,
        area_cnpq_codigo: "1.03.03.04-2",
        area_cnpq_nome: "Engenharia de Software / Redes de Computadores",
        agencia_pagadora: "CNPq",
        plano_trabalho:
          "Caracterização empírica de protocolos BATMAN-adv, OLSR e Babel em testbed de 12 nós Raspberry Pi, com medição de throughput, latência fim-a-fim e overhead de controle sob diferentes topologias.",
        lattes_orientador_snapshot: "http://lattes.cnpq.br/1234567890123456",
        lattes_bolsista_snapshot: "http://lattes.cnpq.br/9876543210987654",
        produtos_esperados: {
          publicacoes: 1,
          apresentacao_seminario: true,
        },
      },
      recursos: {
        repositorio_git: "https://github.com/ufopa-mesh/pibic-2025",
        outros: [],
      },
    },

    // --- 5. PD_EMBRAPII ---
    {
      titulo: "Sensor IoT para monitoramento de qualidade da água em rios amazônicos",
      descricao:
        "Desenvolvimento de uma rede de sensores de baixo custo para medição contínua de turbidez, pH, oxigênio dissolvido e temperatura em afluentes da bacia amazônica. Integra hardware open-source, conectividade LoRaWAN e plataforma de visualização em tempo real.",
      tipo: "PD_EMBRAPII",
      status: "em_andamento",
      sigaa_id: "EMBRAPII-2024-AGUA",
      programa_id: embrapii._id,
      // sem unidade_academica_id: PD_EMBRAPII nao se vincula a unidade academica.
      campus: "Tapajós",
      vigencia: {
        inicio: daysAgo(280),
        fim: daysFromNow(80),
        prorrogacoes: [
          {
            nova_data_fim: daysFromNow(80),
            motivo: "Atraso na importação de sensores específicos (Yokogawa).",
            registrado_em: daysAgo(40),
          },
        ],
      },
      equipe: [
        {
          usuario_id: carlos._id,
          nome: carlos.nome,
          papel: "coordenador" as const,
          categoria: carlos.categoria,
          carga_horaria_semanal: 12,
          periodo: { inicio: daysAgo(280) },
        },
        {
          usuario_id: rafael._id,
          nome: rafael.nome,
          papel: "bolsista" as const,
          categoria: rafael.categoria,
          tipo_vinculo: "bolsista" as const,
          valor_bolsa: 1200,
          carga_horaria_semanal: 30,
          periodo: { inicio: daysAgo(240) },
        },
        {
          usuario_id: larissa._id,
          nome: larissa.nome,
          papel: "bolsista" as const,
          categoria: larissa.categoria,
          tipo_vinculo: "bolsista" as const,
          valor_bolsa: 1200,
          carga_horaria_semanal: 30,
          periodo: { inicio: daysAgo(240) },
        },
      ],
      cronograma: cronogramaPadrao(daysAgo(280)),
      metadados_programa: {
        empresa_parceira: {
          razao_social: "AmazonTech Soluções Ambientais LTDA",
          cnpj: "12.345.678/0001-90",
          porte: "pequena",
        },
        trl_inicial: 3,
        trl_alvo: 6,
        area_tecnologica: "IoT / Sensoriamento ambiental",
        valor_total: 380000,
        valor_contrapartida_empresa: 95000,
        valor_embrapii: 190000,
        valor_unidade: 95000,
        marcos_contratuais: [
          {
            descricao: "Prototipo do nó sensor (TRL 4)",
            prazo: daysAgo(180),
            concluido: true,
          },
          {
            descricao: "Validação em laboratório (TRL 5)",
            prazo: daysAgo(60),
            concluido: true,
          },
          {
            descricao: "Validação em campo (TRL 6)",
            prazo: daysFromNow(60),
            concluido: false,
          },
        ],
      },
      recursos: {
        repositorio_git: "https://github.com/embrapii-ufopa/sensor-agua",
        drive: "https://drive.google.com/drive/sensor-agua",
        outros: [
          {
            nome: "Dashboard MQTT",
            url: "https://dashboard.embrapii.ufopa.edu.br",
            tipo: "dashboard",
          },
        ],
      },
    },

    // --- 6. OUTRO (catch-all) ---
    {
      titulo: "Curso de extensão em Pedagogia Decolonial",
      descricao:
        "Curso de extensão livre voltado para professores da rede pública do Tapajós, com 60 horas distribuídas em 8 sábados, abordando epistemologias indígenas e práticas pedagógicas decoloniais.",
      tipo: "OUTRO",
      status: "planejado",
      programa_id: piape._id, // reusa PIAPE mas marca como OUTRO
      unidade_academica_id: iced._id,
      campus: "Tapajós",
      vigencia: {
        inicio: daysFromNow(20),
        fim: daysFromNow(180),
        prorrogacoes: [],
      },
      equipe: [
        {
          usuario_id: ana._id,
          nome: ana.nome,
          papel: "coordenador" as const,
          categoria: ana.categoria,
          carga_horaria_semanal: 6,
          periodo: { inicio: daysFromNow(20) },
        },
      ],
      cronograma: [],
      metadados_programa: {
        descricao_programa:
          "Programa institucional próprio da UFOPA voltado para formação continuada de professores em pedagogias decoloniais.",
        // campos livres alem do obrigatorio:
        carga_horaria_total: 60,
        publico_alvo: "Professores da rede pública municipal",
        modalidade: "presencial",
        vagas: 30,
      },
      recursos: { outros: [] },
    },
  ]);

  const [, projPet, , projPibic, projEmbrapii] = projetosInseridos;

  // ========================================================
  // REGISTROS DE HORAS (26 — distribuidos, embedados em usuarios)
  // ========================================================
  console.log("Inserindo registros de horas...");

  const tiposHoras = ["desenvolvimento", "reuniao", "escrita", "pesquisa", "ensino", "extensao"] as const;

  const registrosBase = [
    // João no PIBIC (8 registros, 7 aprovados + 1 pendente)
    { projeto: projPibic._id, usuario: joao._id, dias: 30, horas: 4, atividade: "Setup do testbed Raspberry Pi", tipo: "desenvolvimento" as const, aprovado: true },
    { projeto: projPibic._id, usuario: joao._id, dias: 28, horas: 3, atividade: "Configuração BATMAN-adv nos nós", tipo: "desenvolvimento" as const, aprovado: true },
    { projeto: projPibic._id, usuario: joao._id, dias: 25, horas: 2, atividade: "Reunião de orientação semanal", tipo: "reuniao" as const, aprovado: true },
    { projeto: projPibic._id, usuario: joao._id, dias: 21, horas: 5, atividade: "Medição de throughput com iperf3", tipo: "pesquisa" as const, aprovado: true },
    { projeto: projPibic._id, usuario: joao._id, dias: 18, horas: 4, atividade: "Análise dos resultados preliminares", tipo: "pesquisa" as const, aprovado: true },
    { projeto: projPibic._id, usuario: joao._id, dias: 14, horas: 3, atividade: "Comparação OLSR vs Babel", tipo: "pesquisa" as const, aprovado: true },
    { projeto: projPibic._id, usuario: joao._id, dias: 7, horas: 4, atividade: "Escrita do relatório parcial", tipo: "escrita" as const, aprovado: true },
    { projeto: projPibic._id, usuario: joao._id, dias: 2, horas: 3, atividade: "Reunião com orientadora — revisão do texto", tipo: "reuniao" as const, aprovado: false },

    // João no PET (5 registros)
    { projeto: projPet._id, usuario: joao._id, dias: 27, horas: 3, atividade: "Plantão de tutoria em Programação I", tipo: "ensino" as const, aprovado: true },
    { projeto: projPet._id, usuario: joao._id, dias: 20, horas: 4, atividade: "Oficina Python para calouros", tipo: "ensino" as const, aprovado: true },
    { projeto: projPet._id, usuario: joao._id, dias: 13, horas: 3, atividade: "Plantão de tutoria", tipo: "ensino" as const, aprovado: true },
    { projeto: projPet._id, usuario: joao._id, dias: 6, horas: 2, atividade: "Reunião do grupo PET", tipo: "reuniao" as const, aprovado: false },
    { projeto: projPet._id, usuario: joao._id, dias: 3, horas: 4, atividade: "Curso de robótica em escola pública", tipo: "extensao" as const, aprovado: false },

    // Rafael no Embrapii (6 registros)
    { projeto: projEmbrapii._id, usuario: rafael._id, dias: 26, horas: 6, atividade: "Calibração de sensor de pH", tipo: "desenvolvimento" as const, aprovado: true },
    { projeto: projEmbrapii._id, usuario: rafael._id, dias: 22, horas: 5, atividade: "Implementação firmware LoRaWAN", tipo: "desenvolvimento" as const, aprovado: true },
    { projeto: projEmbrapii._id, usuario: rafael._id, dias: 17, horas: 4, atividade: "Validação em laboratório", tipo: "pesquisa" as const, aprovado: true },
    { projeto: projEmbrapii._id, usuario: rafael._id, dias: 12, horas: 3, atividade: "Reunião com empresa parceira", tipo: "reuniao" as const, aprovado: true },
    { projeto: projEmbrapii._id, usuario: rafael._id, dias: 8, horas: 5, atividade: "Documentação do firmware", tipo: "escrita" as const, aprovado: false },
    { projeto: projEmbrapii._id, usuario: rafael._id, dias: 1, horas: 4, atividade: "Preparação do field trip", tipo: "desenvolvimento" as const, aprovado: false },

    // Larissa no Embrapii (4 registros)
    { projeto: projEmbrapii._id, usuario: larissa._id, dias: 24, horas: 5, atividade: "Análise de schematics dos sensores", tipo: "pesquisa" as const, aprovado: true },
    { projeto: projEmbrapii._id, usuario: larissa._id, dias: 16, horas: 4, atividade: "Programação do dashboard MQTT", tipo: "desenvolvimento" as const, aprovado: true },
    { projeto: projEmbrapii._id, usuario: larissa._id, dias: 9, horas: 3, atividade: "Reunião de design review", tipo: "reuniao" as const, aprovado: true },
    { projeto: projEmbrapii._id, usuario: larissa._id, dias: 4, horas: 5, atividade: "Implementação do alerta de qualidade", tipo: "desenvolvimento" as const, aprovado: false },

    // Juliana no PIAPE (3 registros)
    { projeto: projetosInseridos[2]._id, usuario: juliana._id, dias: 23, horas: 4, atividade: "Oficina em Vila Curuai", tipo: "extensao" as const, aprovado: true },
    { projeto: projetosInseridos[2]._id, usuario: juliana._id, dias: 15, horas: 3, atividade: "Preparação de material didático", tipo: "escrita" as const, aprovado: true },
    { projeto: projetosInseridos[2]._id, usuario: juliana._id, dias: 5, horas: 4, atividade: "Oficina em Suruacá", tipo: "extensao" as const, aprovado: false },
  ];

  // Horas agora sao embedadas em usuarios.registros_horas[] (sem usuario_id:
  // o dono e o documento pai). Agrupa por pessoa e grava o array de uma vez.
  type RegistroSeed = {
    _id: Types.ObjectId;
    projeto_id: Types.ObjectId;
    data: Date;
    horas: number;
    atividade: string;
    tipo: (typeof tiposHoras)[number];
    status: "aprovado" | "pendente";
    criado_em: Date;
    aprovacao?: {
      aprovador_id: Types.ObjectId;
      aprovado_em: Date;
      observacao: string;
    };
  };
  const registrosPorUsuario = new Map<string, RegistroSeed[]>();
  for (const r of registrosBase) {
    const registro = {
      _id: oid(),
      projeto_id: r.projeto,
      data: daysAgo(r.dias),
      horas: r.horas,
      atividade: r.atividade,
      tipo: r.tipo,
      status: r.aprovado ? ("aprovado" as const) : ("pendente" as const),
      criado_em: daysAgo(r.dias),
      ...(r.aprovado && {
        aprovacao: {
          aprovador_id: maria._id, // simplificacao: maria aprova tudo
          aprovado_em: daysAgo(r.dias - 1),
          observacao: "OK",
        },
      }),
    };
    const key = String(r.usuario);
    const lista = registrosPorUsuario.get(key) ?? [];
    lista.push(registro);
    registrosPorUsuario.set(key, lista);
  }

  await Promise.all(
    [...registrosPorUsuario.entries()].map(([usuarioId, registros]) =>
      UsuarioModel.updateOne(
        { _id: new Types.ObjectId(usuarioId) },
        { $set: { registros_horas: registros } },
      ),
    ),
  );

  // ========================================================
  // ARQUIVOS (5)
  // ========================================================
  console.log("Inserindo arquivos (embedados nos projetos)...");
  // Arquivos agora vivem em projetos.arquivos[] (sem projeto_id: o dono e o
  // documento pai). Cada arquivo recebe _id proprio e enviado_em.
  await ProjetoModel.updateOne(
    { _id: projPibic._id },
    {
      $set: {
        arquivos: [
          {
            _id: oid(),
            enviado_por: joao._id,
            nome: "plano_trabalho_pibic_joao.pdf",
            tipo_documento: "plano_trabalho",
            mime_type: "application/pdf",
            tamanho_bytes: 245_678,
            url_storage: "s3://pesquisahub/mock/plano-pibic.pdf",
            metadata_arquivo: {
              hash_sha256: "abc123def456",
              num_paginas: 12,
              versao: 1,
            },
            enviado_em: daysAgo(110),
          },
          {
            _id: oid(),
            enviado_por: maria._id,
            nome: "relatorio_parcial_pibic.pdf",
            tipo_documento: "relatorio_parcial",
            mime_type: "application/pdf",
            tamanho_bytes: 1_245_000,
            url_storage: "s3://pesquisahub/mock/rel-parcial-pibic.pdf",
            metadata_arquivo: {
              hash_sha256: "def456ghi789",
              num_paginas: 24,
              versao: 2,
            },
            enviado_em: daysAgo(8),
          },
        ],
      },
    },
  );

  await ProjetoModel.updateOne(
    { _id: projEmbrapii._id },
    {
      $set: {
        arquivos: [
          {
            _id: oid(),
            enviado_por: carlos._id,
            nome: "contrato_embrapii_amazontech.pdf",
            tipo_documento: "contrato",
            mime_type: "application/pdf",
            tamanho_bytes: 890_000,
            url_storage: "s3://pesquisahub/mock/contrato-embrapii.pdf",
            metadata_arquivo: {
              hash_sha256: "ghi789jkl012",
              num_paginas: 18,
              versao: 1,
            },
            enviado_em: daysAgo(270),
          },
          {
            _id: oid(),
            enviado_por: rafael._id,
            nome: "schematic_sensor_v3.pdf",
            tipo_documento: "documentacao_tecnica",
            mime_type: "application/pdf",
            tamanho_bytes: 3_400_000,
            url_storage: "s3://pesquisahub/mock/schematic.pdf",
            metadata_arquivo: { versao: 3 },
            tags: ["hardware", "schematic"],
            enviado_em: daysAgo(20),
          },
        ],
      },
    },
  );

  await ProjetoModel.updateOne(
    { _id: projPet._id },
    {
      $set: {
        arquivos: [
          {
            _id: oid(),
            enviado_por: carlos._id,
            nome: "relatorio_anual_pet_2025.pdf",
            tipo_documento: "relatorio_final",
            mime_type: "application/pdf",
            tamanho_bytes: 2_100_000,
            url_storage: "s3://pesquisahub/mock/relatorio-pet.pdf",
            metadata_arquivo: { versao: 1, num_paginas: 42 },
            enviado_em: daysAgo(15),
          },
        ],
      },
    },
  );

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de demo (todos com senha:", SEED_PASSWORD, "):");
  console.log("  Admin       →", QUICK_LOGIN.admin.email);
  console.log("  Coordenador →", QUICK_LOGIN.coord.email);
  console.log("  Bolsista    →", QUICK_LOGIN.bolsista.email);
}

main()
  .then(() => {
    console.log("\nDesconectando...");
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Erro no seed:", err);
    mongoose.disconnect().finally(() => process.exit(1));
  });
