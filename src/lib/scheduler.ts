import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Member, Schedule, Role } from "./types";
import { addSchedules, deleteSchedulesForWeekAndType } from "./store";
import { getScheduleDeadlineText, calculateScheduleDeadlineDate } from "./dateUtils";

const DAYS_OF_WEEK = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const generateWeeklySchedule = async (startDate: Date, members: Member[], type: "Fiscalizador" | "Diretor" | string, responsibleId: string) => {
  let activeMembers = members.filter(m => m.role === type && m.status === "Ativo");
  if (activeMembers.length === 0) {
    activeMembers = members.filter(m => m.status === "Ativo");
  }
  
  if (activeMembers.length === 0) {
    throw new Error(`Nenhum membro ativo encontrado para a função: ${type}`);
  }

  // Embaralhar aleatoriamente os membros para que cada geração/regeneração reordene a escala da semana
  activeMembers = [...activeMembers].sort(() => Math.random() - 0.5);

  // Identificador da semana (ex: 2026-W30) - Simplificado
  const weekNumber = format(startDate, "I"); 
  const weekId = `${format(startDate, "yyyy")}-W${weekNumber}`;
  const typeCode = type.replace(/\s+/g, '').substring(0, 3).toUpperCase();

  const schedules: Schedule[] = [];
  let memberIndex = 0;

  for (let i = 0; i < 7; i++) {
    const currentDay = addDays(startDate, i);
    const scheduleDateStr = format(currentDay, "yyyy-MM-dd");
    const deadlineIso = calculateScheduleDeadlineDate(DAYS_OF_WEEK[i], scheduleDateStr, weekId);
    
    // Escolhe o membro
    const member = activeMembers[memberIndex % activeMembers.length];
    memberIndex++;

    const deadlineFormatted = getScheduleDeadlineText(DAYS_OF_WEEK[i]);
    
    const newSchedule: Schedule = {
      id: `SSI-ESC-${Date.now().toString(36).toUpperCase()}-${i}-${typeCode}`,
      week: weekId,
      memberId: member.id,
      referenceDay: DAYS_OF_WEEK[i],
      scheduleDate: scheduleDateStr,
      deadline: deadlineFormatted,
      deadlineDate: deadlineIso,
      status: "Pendente",
      responsibleId,
      type: type as any
    };

    schedules.push(newSchedule);
  }

  if (type === "Fiscalizador") {
    const startDateStr = format(startDate, "yyyy-MM-dd");
    const avalDeadlineIso = calculateScheduleDeadlineDate("Avaliadores", startDateStr, weekId);
    const capDeadlineIso = calculateScheduleDeadlineDate("Capacitadores", startDateStr, weekId);

    const memberAval = activeMembers[memberIndex % activeMembers.length];
    memberIndex++;
    const memberCap = activeMembers[memberIndex % activeMembers.length];
    memberIndex++;

    schedules.push({
      id: `SSI-ESC-${Date.now().toString(36).toUpperCase()}-AVAL-FIS`,
      week: weekId,
      memberId: memberAval.id,
      referenceDay: "Avaliadores",
      scheduleDate: startDateStr,
      deadline: "Terça (23:59)",
      deadlineDate: avalDeadlineIso,
      status: "Pendente",
      responsibleId,
      type: "Fiscalização dos Avaliadores" as any
    });

    schedules.push({
      id: `SSI-ESC-${Date.now().toString(36).toUpperCase()}-CAP-FIS`,
      week: weekId,
      memberId: memberCap.id,
      referenceDay: "Capacitadores",
      scheduleDate: startDateStr,
      deadline: "Terça (23:59)",
      deadlineDate: capDeadlineIso,
      status: "Pendente",
      responsibleId,
      type: "Fiscalização dos Capacitadores" as any
    });
  }

  // Deleta as existentes desta semana para esse tipo e adiciona as novas
  await deleteSchedulesForWeekAndType(weekId, type as any);
  if (type === "Fiscalizador") {
    await deleteSchedulesForWeekAndType(weekId, "Fiscalização dos Avaliadores");
    await deleteSchedulesForWeekAndType(weekId, "Fiscalização dos Capacitadores");
    await deleteSchedulesForWeekAndType(weekId, "Fiscalização de Avaliadores");
    await deleteSchedulesForWeekAndType(weekId, "Fiscalização de Capacitadores");
  }
  await addSchedules(schedules);
  
  return weekId;
};

