import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Member, Schedule, Role } from "./types";
import { addSchedules, deleteSchedulesForWeekAndType } from "./store";

const DAYS_OF_WEEK = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const generateWeeklySchedule = async (startDate: Date, members: Member[], type: "Fiscalizador" | "Diretor" | "Fiscalização de Avaliadores" | "Fiscalização de Capacitadores" | string, responsibleId: string) => {
  let activeMembers = members.filter(m => m.role === type && m.status === "Ativo");
  
  // Para as novas funções de fiscalização, utilizar fiscalizadores, diretores ou vice-presidentes ativos
  if ((type === "Fiscalização de Avaliadores" || type === "Fiscalização de Capacitadores" || activeMembers.length === 0) && members.length > 0) {
    activeMembers = members.filter(m => (m.role === "Fiscalizador" || m.role === "Diretor" || m.role === "Vice-Presidente") && m.status === "Ativo");
  }
  
  if (activeMembers.length === 0) {
    activeMembers = members.filter(m => m.status === "Ativo");
  }
  
  if (activeMembers.length === 0) {
    throw new Error(`Nenhum membro ativo encontrado para a função: ${type}`);
  }

  // Identificador da semana (ex: 2026-W30) - Simplificado
  const weekNumber = format(startDate, "I"); 
  const weekId = `${format(startDate, "yyyy")}-W${weekNumber}`;

  const schedules: Schedule[] = [];
  
  // Para distribuir de forma uniforme, faremos um round-robin simples
  let memberIndex = 0;

  for (let i = 0; i < 7; i++) {
    const currentDay = addDays(startDate, i);
    const deadlineDay = addDays(currentDay, 2);
    // Definir para 23:59:59
    deadlineDay.setHours(23, 59, 59, 999);
    
    // Escolhe o membro
    const member = activeMembers[memberIndex % activeMembers.length];
    memberIndex++;

    const deadlineFormatted = `${format(deadlineDay, "EEEE", { locale: ptBR })} (23:59)`;
    const typeCode = type.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    
    const newSchedule: Schedule = {
      id: `SSI-ESC-${Date.now().toString(36).toUpperCase()}-${i}-${typeCode}`,
      week: weekId,
      memberId: member.id,
      referenceDay: DAYS_OF_WEEK[i],
      deadline: deadlineFormatted.charAt(0).toUpperCase() + deadlineFormatted.slice(1),
      deadlineDate: deadlineDay.toISOString(),
      status: "Pendente",
      responsibleId,
      type: type as any
    };

    schedules.push(newSchedule);
  }

  // Deleta as existentes desta semana para esse tipo e adiciona as novas
  await deleteSchedulesForWeekAndType(weekId, type as any);
  await addSchedules(schedules);
  
  return weekId;
};

